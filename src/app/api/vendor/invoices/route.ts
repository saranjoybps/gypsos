import { db, handle, requireVendor } from "@/lib/portal/server";
import type { Invoice } from "@/lib/portal/types";

export const GET = handle(async (req) => {
  const vendor = await requireVendor(req);
  const snap = await db().collection("invoices").where("vendorId", "==", vendor.id).get();
  const invoices = snap.docs.map((d) => ({ ...(d.data() as Omit<Invoice, "id">), id: d.id })).sort((a, b) => b.date.localeCompare(a.date));
  return { invoices };
});
