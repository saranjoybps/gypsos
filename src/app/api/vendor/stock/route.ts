import { ApiError, getMovements, getStock, handle, readJson, reduceStock, requireVendor } from "@/lib/portal/server";

export const GET = handle(async (req) => {
  const vendor = await requireVendor(req);
  const [stock, movements] = await Promise.all([getStock(vendor.id), getMovements(vendor.id)]);
  return { stock, movements };
});

/** Vendor records a sale: reduces their own stock. */
export const POST = handle(async (req) => {
  const vendor = await requireVendor(req);
  const body = await readJson(req);
  if (typeof body.productId !== "string") throw new ApiError(400, "Select a product.");
  const result = await reduceStock({
    vendorId: vendor.id,
    productId: body.productId,
    qty: Number(body.qty),
    source: "vendor",
    note: typeof body.note === "string" ? body.note.trim() : "",
  });
  return result;
});
