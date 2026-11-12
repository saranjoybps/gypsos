import { db, handle, requireAdmin } from "@/lib/portal/server";
import type { Invoice } from "@/lib/portal/types";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const snap = await db().collection("invoices").get();
  const invoices = snap.docs.map((d) => ({ ...(d.data() as Omit<Invoice, "id">), id: d.id })).sort((a, b) => b.date.localeCompare(a.date));
  return { invoices };
});
