import { ApiError, db, handle, requireVendor } from "@/lib/portal/server";
import type { Invoice } from "@/lib/portal/types";

export const GET = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const vendor = await requireVendor(req);
  const { id } = await params;
  const snap = await db().doc(`invoices/${id}`).get();
  // A vendor can only ever open their own invoices.
  if (!snap.exists || (snap.data() as Invoice).vendorId !== vendor.id) throw new ApiError(404, "Invoice not found.");
  return { invoice: { ...(snap.data() as Omit<Invoice, "id">), id: snap.id } };
});
