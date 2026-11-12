import { db, handle, requireAdmin } from "@/lib/portal/server";
import type { Vendor } from "@/lib/portal/types";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const snap = await db().collection("vendors").get();
  const vendors = snap.docs.map((d) => ({ ...(d.data() as Omit<Vendor, "id">), id: d.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { vendors };
});
