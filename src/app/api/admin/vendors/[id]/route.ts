import { ApiError, db, getVendor, handle, nowIso, readJson, requireAdmin } from "@/lib/portal/server";

export const GET = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  await requireAdmin(req);
  const vendor = await getVendor((await params).id);
  if (!vendor) throw new ApiError(404, "Vendor not found.");
  return { vendor };
});

/** Admin decisions on a vendor: registration approval and KYC review. */
export const PATCH = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  await requireAdmin(req);
  const vendor = await getVendor((await params).id);
  if (!vendor) throw new ApiError(404, "Vendor not found.");
  const body = await readJson(req);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 400) : "";
  const ref = db().doc(`vendors/${vendor.id}`);

  switch (body.action) {
    case "approve":
    case "reinstate":
      await ref.update({ status: "approved", statusNote: note });
      break;
    case "reject":
      if (!note) throw new ApiError(400, "Add a reason for rejecting this registration.");
      await ref.update({ status: "rejected", statusNote: note });
      break;
    case "suspend":
      await ref.update({ status: "suspended", statusNote: note });
      break;
    case "kyc_verify":
      if (vendor.kyc?.status !== "submitted") throw new ApiError(400, "There is no submitted KYC to verify.");
      await ref.update({ "kyc.status": "verified", "kyc.remarks": note, "kyc.verifiedAt": nowIso() });
      break;
    case "kyc_reject":
      if (vendor.kyc?.status !== "submitted") throw new ApiError(400, "There is no submitted KYC to reject.");
      if (!note) throw new ApiError(400, "Tell the vendor what to correct.");
      await ref.update({ "kyc.status": "rejected", "kyc.remarks": note });
      break;
    default:
      throw new ApiError(400, "Unknown action.");
  }
  return {};
});
