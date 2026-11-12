import { ApiError, db, handle, requireAdmin } from "@/lib/portal/server";
import type { Invoice } from "@/lib/portal/types";

export const GET = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  await requireAdmin(req);
  const snap = await db().doc(`invoices/${(await params).id}`).get();
  if (!snap.exists) throw new ApiError(404, "Invoice not found.");
  return { invoice: { ...(snap.data() as Omit<Invoice, "id">), id: snap.id } };
});
