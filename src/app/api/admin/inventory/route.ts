import { ApiError, db, getMovements, getStock, getVendor, handle, readJson, reduceStock, requireAdmin } from "@/lib/portal/server";
import type { Vendor } from "@/lib/portal/types";

/** Without ?vendorId: every vendor's stock overview. With ?vendorId: that vendor's stock + movement history. */
export const GET = handle(async (req) => {
  await requireAdmin(req);
  const vendorId = new URL(req.url).searchParams.get("vendorId");
  if (vendorId) {
    const vendor = await getVendor(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found.");
    const [stock, movements] = await Promise.all([getStock(vendorId), getMovements(vendorId, 100)]);
    return { vendor, stock, movements };
  }
  const snap = await db().collection("vendors").where("status", "==", "approved").get();
  const vendors = await Promise.all(
    snap.docs.map(async (d) => {
      const v = { ...(d.data() as Omit<Vendor, "id">), id: d.id } as Vendor;
      return { id: v.id, vendorCode: v.vendorCode, businessName: v.businessName, stock: await getStock(v.id) };
    }),
  );
  return { vendors: vendors.sort((a, b) => a.vendorCode.localeCompare(b.vendorCode)) };
});

/** Admin bypass: reduce a vendor's stock directly (e.g. when the vendor cannot record their own sales). */
export const POST = handle(async (req) => {
  await requireAdmin(req);
  const body = await readJson(req);
  if (typeof body.vendorId !== "string" || typeof body.productId !== "string") throw new ApiError(400, "Select a vendor and a product.");
  if (!(await getVendor(body.vendorId))) throw new ApiError(404, "Vendor not found.");
  return reduceStock({
    vendorId: body.vendorId,
    productId: body.productId,
    qty: Number(body.qty),
    source: "admin",
    note: typeof body.note === "string" ? body.note.trim() : "",
  });
});
