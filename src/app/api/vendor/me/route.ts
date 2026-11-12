import { handle, requireVendorAny } from "@/lib/portal/server";

/** The signed-in vendor's own record (any status, so a pending vendor can see their approval state). */
export const GET = handle(async (req) => ({ vendor: await requireVendorAny(req) }));
