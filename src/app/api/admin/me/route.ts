import { db, handle, requireAdmin } from "@/lib/portal/server";

/** Confirms the caller is the admin UID and returns dashboard counts. */
export const GET = handle(async (req) => {
  await requireAdmin(req);
  const [vendors, requests] = await Promise.all([db().collection("vendors").get(), db().collection("stockRequests").get()]);
  const v = vendors.docs.map((d) => d.data() as { status: string; kyc?: { status: string } });
  const r = requests.docs.map((d) => d.data() as { status: string });
  return {
    stats: {
      vendors: v.length,
      pendingVendors: v.filter((x) => x.status === "pending").length,
      kycToReview: v.filter((x) => x.kyc?.status === "submitted").length,
      pendingRequests: r.filter((x) => x.status === "pending" || x.status === "approved").length,
      invoicesSent: r.filter((x) => x.status === "sent").length,
    },
  };
});
