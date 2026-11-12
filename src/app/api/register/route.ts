import { ApiError, adminAuth, db, handle, nextVendorCode, nowIso, readJson } from "@/lib/portal/server";
import { EMPTY_KYC, readRegister, validateRegister } from "@/lib/portal/validation";

/** Vendor self-registration. Creates the login and a PENDING vendor record with an auto-generated vendor code. */
export const POST = handle(async (req) => {
  const body = await readJson(req);
  // Honeypot: bots fill hidden fields; real visitors never see this one.
  if (typeof body.website === "string" && body.website.trim() !== "") return { vendorCode: "" };

  const input = readRegister(body);
  const errors = validateRegister(input);
  if (Object.keys(errors).length > 0) throw new ApiError(422, "Please fix the highlighted fields.", errors as Record<string, string>);

  let uid: string;
  try {
    const user = await adminAuth().createUser({ email: input.email, password: input.password, displayName: input.fullName });
    uid = user.uid;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-exists") throw new ApiError(409, "An account with this email already exists. Please sign in.", { email: "This email is already registered." });
    if (code === "auth/invalid-password") throw new ApiError(422, "Please choose a stronger password.", { password: "Use at least 8 characters." });
    throw error;
  }

  try {
    const vendorCode = await nextVendorCode();
    const { password: _password, ...profile } = input;
    void _password;
    await db()
      .doc(`vendors/${uid}`)
      .set({
        ...profile,
        vendorCode,
        status: "pending",
        statusNote: "",
        kyc: { status: "not_submitted", remarks: "", data: EMPTY_KYC },
        createdAt: nowIso(),
      });
    return { vendorCode };
  } catch (error) {
    await adminAuth().deleteUser(uid).catch(() => undefined); // never leave a login without a vendor record
    throw error;
  }
});
