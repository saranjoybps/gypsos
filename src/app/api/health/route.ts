/**
 * TEMPORARY diagnostics for deployment problems. Reports which server settings exist (true/false only,
 * never the values) and which startup step fails. Delete this file once the deployment works.
 */
export const dynamic = "force-dynamic";

const short = (e: unknown) => (e instanceof Error ? `${e.name}: ${e.message}` : String(e)).slice(0, 300);

const NAMES = [
  "FIREBASE_SERVICE_ACCOUNT",
  "ADMIN_UID",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "ENQUIRY_TO",
];

export async function GET() {
  const report: Record<string, unknown> = {
    node: process.version,
    env: Object.fromEntries(NAMES.map((n) => [n, Boolean(process.env[n])])),
  };

  let mod: typeof import("@/lib/portal/server");
  try {
    mod = await import("@/lib/portal/server");
    report.loadServerModule = "ok";
  } catch (e) {
    report.loadServerModule = short(e);
    return Response.json(report, { status: 500 });
  }

  try {
    await mod.db().collection("products").limit(1).get();
    report.firestore = "ok";
  } catch (e) {
    report.firestore = short(e);
  }

  try {
    await mod.adminAuth().listUsers(1);
    report.auth = "ok";
  } catch (e) {
    report.auth = short(e);
  }

  return Response.json(report);
}
