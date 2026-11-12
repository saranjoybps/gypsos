import { ApiError, db, handle, listProducts, readJson, requireAdmin } from "@/lib/portal/server";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  return { products: await listProducts() };
});

/** Update a product's price / availability. */
export const PUT = handle(async (req) => {
  await requireAdmin(req);
  const body = await readJson(req);
  const price = Number(body.price);
  if (typeof body.id !== "string") throw new ApiError(400, "Missing product.");
  if (!Number.isFinite(price) || price < 0 || price > 10_000_000) throw new ApiError(400, "Enter a valid price.");
  const ref = db().doc(`products/${body.id}`);
  if (!(await ref.get()).exists) throw new ApiError(404, "Product not found.");
  await ref.update({ price: Math.round(price * 100) / 100, active: body.active !== false });
  return {};
});
