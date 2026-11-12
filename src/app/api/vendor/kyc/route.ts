import { ApiError, db, handle, nowIso, readJson, requireVendor } from "@/lib/portal/server";
import { readKyc, validateKyc } from "@/lib/portal/validation";

/** Vendor submits / resubmits KYC details (text only). Verified KYC is locked. */
export const PUT = handle(async (req) => {
  const vendor = await requireVendor(req);
  if (vendor.kyc?.status === "verified") throw new ApiError(400, "Your KYC is already verified. Contact GYPSOS to change it.");
  const data = readKyc(await readJson(req));
  const errors = validateKyc(data);
  if (Object.keys(errors).length > 0) throw new ApiError(422, "Please fix the highlighted fields.", errors as Record<string, string>);
  await db()
    .doc(`vendors/${vendor.id}`)
    .update({ kyc: { status: "submitted", remarks: "", data, submittedAt: nowIso() } });
  return {};
});
