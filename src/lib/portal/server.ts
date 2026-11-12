import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { COMPANY, DEFAULT_PRODUCTS } from "@/lib/portal/company";
import type { Invoice, InvoiceItem, Product, RequestItem, StockMovement, StockRequest, StockRow, Vendor } from "@/lib/portal/types";

/* ------------------------------------------------------------------ */
/* Firebase Admin (service account comes from the FIREBASE_SERVICE_ACCOUNT env var, one-line JSON) */
/* ------------------------------------------------------------------ */

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

/**
 * Reads FIREBASE_SERVICE_ACCOUNT leniently, because hosting dashboards often alter pasted/imported values:
 * surrounding quotes kept, escaped quotes, real line breaks inside the key, or the JSON given as base64.
 */
function readServiceAccount(): ServiceAccount {
  let raw = (process.env.FIREBASE_SERVICE_ACCOUNT ?? "").trim();
  if (!raw) throw new ApiError(500, "Server is not configured: FIREBASE_SERVICE_ACCOUNT is missing.");
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) raw = raw.slice(1, -1).trim();
  if (!raw.startsWith("{")) {
    try {
      raw = Buffer.from(raw, "base64").toString("utf8").trim();
    } catch {
      /* handled below */
    }
  }
  const attempts = [raw, raw.replace(/\\"/g, '"'), raw.replace(/\r?\n/g, "\\n"), raw.replace(/\\"/g, '"').replace(/\r?\n/g, "\\n")];
  for (const text of attempts) {
    try {
      const sa = JSON.parse(text) as Partial<ServiceAccount>;
      if (sa.project_id && sa.client_email && sa.private_key) return sa as ServiceAccount;
    } catch {
      /* try the next variant */
    }
  }
  throw new ApiError(500, "Server is not configured: FIREBASE_SERVICE_ACCOUNT could not be read. Paste the full service account JSON on one line (no extra quotes).");
}

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const sa = readServiceAccount();
  return initializeApp({ credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key.replace(/\\n/g, "\n") }) });
}

export const adminAuth = () => getAuth(adminApp());
export const db = () => getFirestore(adminApp());

/* ------------------------------------------------------------------ */
/* Errors + guards                                                      */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Wraps a route handler so thrown ApiErrors become JSON responses and nothing else leaks. */
export function handle<C = unknown>(fn: (req: Request, ctx: C) => Promise<unknown>) {
  return async (req: Request, ctx: C) => {
    try {
      const data = await fn(req, ctx);
      return Response.json({ ok: true, ...(data as object) });
    } catch (error) {
      if (error instanceof ApiError) return Response.json({ ok: false, error: error.message, fields: error.fields }, { status: error.status });
      console.error("API error:", error instanceof Error ? error.message : "unknown");
      return Response.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await req.json()) as unknown;
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  throw new ApiError(400, "Invalid request.");
}

async function verify(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiError(401, "Please sign in.");
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }
}

/** Only the single UID in ADMIN_UID is an admin. */
export async function requireAdmin(req: Request) {
  const token = await verify(req);
  if (!process.env.ADMIN_UID || token.uid !== process.env.ADMIN_UID) throw new ApiError(403, "This account is not authorised for the admin portal.");
  return token;
}

export async function getVendor(uid: string): Promise<Vendor | null> {
  const snap = await db().doc(`vendors/${uid}`).get();
  return snap.exists ? ({ ...(snap.data() as Omit<Vendor, "id">), id: snap.id } as Vendor) : null;
}

/** Signed-in vendor, any status (used for the status screen and profile). */
export async function requireVendorAny(req: Request) {
  const token = await verify(req);
  const vendor = await getVendor(token.uid);
  if (!vendor) throw new ApiError(403, "No vendor account found for this login.");
  return vendor;
}

/** Approved vendors only (everything except the status screen). */
export async function requireVendor(req: Request) {
  const vendor = await requireVendorAny(req);
  if (vendor.status !== "approved") throw new ApiError(403, vendor.status === "pending" ? "Your registration is awaiting admin approval." : "Your vendor account is not active.");
  return vendor;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

export const nowIso = () => new Date().toISOString();
export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Indian financial year label, e.g. 2026-27 for dates from 1 April 2026. */
function financialYear(date = new Date()) {
  const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

export const vendorAddress = (v: Pick<Vendor, "address" | "location" | "district" | "state" | "pincode">) =>
  [v.address, v.location, v.district, `${v.state} - ${v.pincode}`].filter(Boolean).join(", ");

/* ------------------------------------------------------------------ */
/* Products                                                             */
/* ------------------------------------------------------------------ */

export async function listProducts(): Promise<Product[]> {
  const col = db().collection("products");
  let snap = await col.get();
  if (snap.empty) {
    const batch = db().batch();
    for (const p of DEFAULT_PRODUCTS) batch.set(col.doc(p.id), { ...p, active: true });
    await batch.commit();
    snap = await col.get();
  }
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Product, "id">), id: d.id })).sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------ */
/* Stock                                                                */
/* ------------------------------------------------------------------ */

export async function getStock(vendorId: string): Promise<StockRow[]> {
  const [products, snap] = await Promise.all([listProducts(), db().collection(`vendors/${vendorId}/stock`).get()]);
  const qty = new Map(snap.docs.map((d) => [d.id, d.data() as { qty: number; updatedAt?: string }]));
  return products.map((p) => ({ productId: p.id, name: p.name, unit: p.unit, qty: qty.get(p.id)?.qty ?? 0, updatedAt: qty.get(p.id)?.updatedAt }));
}

export async function getMovements(vendorId: string, limit = 50): Promise<StockMovement[]> {
  const snap = await db().collection("stockMovements").where("vendorId", "==", vendorId).get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<StockMovement, "id">), id: d.id }))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/** Reduces a vendor's stock (vendor sale, or admin bypass). Never goes below zero. */
export async function reduceStock(opts: { vendorId: string; productId: string; qty: number; source: "vendor" | "admin"; note: string }) {
  const { vendorId, productId, qty, source, note } = opts;
  if (!Number.isInteger(qty) || qty <= 0) throw new ApiError(400, "Enter a whole number greater than zero.");
  const d = db();
  return d.runTransaction(async (tx) => {
    const sRef = d.doc(`vendors/${vendorId}/stock/${productId}`);
    const [pSnap, sSnap] = await Promise.all([tx.get(d.doc(`products/${productId}`)), tx.get(sRef)]);
    if (!pSnap.exists) throw new ApiError(404, "Product not found.");
    const current = sSnap.exists ? ((sSnap.data() as { qty: number }).qty ?? 0) : 0;
    if (qty > current) throw new ApiError(400, `Only ${current} in stock; you cannot reduce by ${qty}.`);
    const at = nowIso();
    const balanceAfter = current - qty;
    tx.set(sRef, { qty: balanceAfter, updatedAt: at }, { merge: true });
    tx.set(d.collection("stockMovements").doc(), {
      vendorId,
      productId,
      productName: (pSnap.data() as Product).name,
      type: "out",
      qty,
      balanceAfter,
      source,
      refId: "",
      note: note.slice(0, 300),
      at,
    });
    return { balance: balanceAfter };
  });
}

/* ------------------------------------------------------------------ */
/* Stock requests                                                       */
/* ------------------------------------------------------------------ */

export async function createRequest(vendor: Vendor, rawItems: unknown, note: string) {
  if (!Array.isArray(rawItems)) throw new ApiError(400, "Select at least one product.");
  const products = await listProducts();
  const merged = new Map<string, number>();
  for (const raw of rawItems) {
    const row = raw as { productId?: unknown; qty?: unknown };
    const qty = Number(row.qty);
    if (typeof row.productId !== "string" || !Number.isInteger(qty) || qty <= 0) continue;
    if (qty > 100000) throw new ApiError(400, "That quantity looks too large.");
    merged.set(row.productId, (merged.get(row.productId) ?? 0) + qty);
  }
  const items: RequestItem[] = [];
  for (const [productId, qty] of merged) {
    const p = products.find((x) => x.id === productId && x.active);
    if (!p) throw new ApiError(400, "One of the selected products is not available.");
    items.push({ productId, name: p.name, unit: p.unit, qty });
  }
  if (items.length === 0) throw new ApiError(400, "Enter a quantity for at least one product.");
  const at = nowIso();
  const doc: Omit<StockRequest, "id"> = {
    vendorId: vendor.id,
    vendorCode: vendor.vendorCode,
    vendorName: vendor.businessName,
    items,
    note: note.slice(0, 500),
    status: "pending",
    adminNote: "",
    invoiceId: "",
    invoiceNumber: "",
    createdAt: at,
    updatedAt: at,
  };
  const ref = await db().collection("stockRequests").add(doc);
  return { id: ref.id };
}

/**
 * Admin sends the invoice for a request. In ONE transaction this:
 *  - generates the next invoice number,
 *  - stores the invoice,
 *  - adds the quantities to the vendor's stock (with movement history),
 *  - marks the request as "sent".
 * Either all of it happens or none of it, so inventory can never drift from invoices.
 */
export async function sendInvoice(requestId: string, opts: { taxRate: number; notes: string; adminNote: string }) {
  const d = db();
  const fy = financialYear();
  return d.runTransaction(async (tx) => {
    const rRef = d.doc(`stockRequests/${requestId}`);
    const rSnap = await tx.get(rRef);
    if (!rSnap.exists) throw new ApiError(404, "Request not found.");
    const request = { ...(rSnap.data() as Omit<StockRequest, "id">), id: rSnap.id };
    if (request.status !== "pending" && request.status !== "approved") throw new ApiError(400, `This request is already ${request.status}.`);

    const vSnap = await tx.get(d.doc(`vendors/${request.vendorId}`));
    if (!vSnap.exists) throw new ApiError(404, "Vendor not found.");
    const vendor = { ...(vSnap.data() as Omit<Vendor, "id">), id: vSnap.id } as Vendor;

    const productSnaps = await Promise.all(request.items.map((i) => tx.get(d.doc(`products/${i.productId}`))));
    const stockSnaps = await Promise.all(request.items.map((i) => tx.get(d.doc(`vendors/${vendor.id}/stock/${i.productId}`))));
    const counterRef = d.doc(`counters/invoice-${fy}`);
    const counterSnap = await tx.get(counterRef);

    const items: InvoiceItem[] = request.items.map((i, idx) => {
      const p = productSnaps[idx].data() as Product | undefined;
      if (!p) throw new ApiError(400, `Product "${i.name}" no longer exists.`);
      const rate = money(p.price);
      return { productId: i.productId, name: p.name, unit: p.unit, qty: i.qty, rate, amount: money(rate * i.qty) };
    });
    const subtotal = money(items.reduce((s, i) => s + i.amount, 0));
    const taxAmount = money((subtotal * opts.taxRate) / 100);
    const seq = ((counterSnap.exists ? (counterSnap.data() as { value: number }).value : 0) ?? 0) + 1;
    const invoiceNumber = `${COMPANY.invoicePrefix}/${fy}/${String(seq).padStart(4, "0")}`;
    const at = nowIso();
    const addr = vendorAddress(vendor);

    const invoiceRef = d.collection("invoices").doc();
    const invoice: Omit<Invoice, "id"> = {
      invoiceNumber,
      requestId,
      vendorId: vendor.id,
      vendorCode: vendor.vendorCode,
      date: at,
      billTo: {
        name: vendor.kyc?.data?.legalName || vendor.businessName,
        contact: vendor.fullName,
        phone: vendor.phone,
        email: vendor.email,
        gstin: vendor.kyc?.data?.gstin ?? "",
        pan: vendor.kyc?.data?.panNumber ?? "",
        address: addr,
      },
      deliveryAddress: vendor.deliveryAddress || addr,
      items,
      subtotal,
      taxRate: opts.taxRate,
      taxAmount,
      total: money(subtotal + taxAmount),
      notes: opts.notes,
    };

    // ---- writes (all reads are done above) ----
    tx.set(counterRef, { value: seq });
    tx.set(invoiceRef, invoice);
    items.forEach((i, idx) => {
      const current = stockSnaps[idx].exists ? ((stockSnaps[idx].data() as { qty: number }).qty ?? 0) : 0;
      const balanceAfter = current + i.qty;
      tx.set(d.doc(`vendors/${vendor.id}/stock/${i.productId}`), { qty: balanceAfter, updatedAt: at }, { merge: true });
      tx.set(d.collection("stockMovements").doc(), {
        vendorId: vendor.id,
        productId: i.productId,
        productName: i.name,
        type: "in",
        qty: i.qty,
        balanceAfter,
        source: "invoice",
        refId: invoiceNumber,
        note: `Stock received against invoice ${invoiceNumber}`,
        at,
      });
    });
    tx.update(rRef, { status: "sent", adminNote: opts.adminNote, invoiceId: invoiceRef.id, invoiceNumber, updatedAt: at });
    return { invoiceId: invoiceRef.id, invoiceNumber };
  });
}

/* ------------------------------------------------------------------ */
/* Vendor registration                                                  */
/* ------------------------------------------------------------------ */

/** Next auto-generated vendor code, e.g. GYP-V-0001. */
export async function nextVendorCode() {
  const d = db();
  const ref = d.doc("counters/vendor");
  const seq = await d.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = (snap.exists ? (snap.data() as { value: number }).value : 0) + 1;
    tx.set(ref, { value: next });
    return next;
  });
  return `GYP-V-${String(seq).padStart(4, "0")}`;
}
