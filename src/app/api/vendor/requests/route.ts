import { createRequest, db, handle, listProducts, readJson, requireVendor } from "@/lib/portal/server";
import type { StockRequest } from "@/lib/portal/types";

export const GET = handle(async (req) => {
  const vendor = await requireVendor(req);
  const [snap, products] = await Promise.all([db().collection("stockRequests").where("vendorId", "==", vendor.id).get(), listProducts()]);
  const requests = snap.docs.map((d) => ({ ...(d.data() as Omit<StockRequest, "id">), id: d.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { requests, products: products.filter((p) => p.active) };
});

export const POST = handle(async (req) => {
  const vendor = await requireVendor(req);
  const body = await readJson(req);
  return createRequest(vendor, body.items, typeof body.note === "string" ? body.note.trim() : "");
});
