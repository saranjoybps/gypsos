import { db, handle, requireAdmin } from "@/lib/portal/server";
import type { StockRequest } from "@/lib/portal/types";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const snap = await db().collection("stockRequests").get();
  const requests = snap.docs.map((d) => ({ ...(d.data() as Omit<StockRequest, "id">), id: d.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { requests };
});
