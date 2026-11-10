import { validateEnquiry, type EnquiryInput } from "@/lib/enquiry";

/**
 * Receives enquiries from the contact form.
 *  - Validates with the same rules as the browser.
 *  - If ENQUIRY_WEBHOOK_URL is configured on the server, forwards the enquiry there as JSON.
 *  - Without it, the enquiry is validated and acknowledged but NOT delivered anywhere: configure a webhook
 *    (or wire an email service) before launch. The webhook URL is never sent to the client.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const text = (key: keyof EnquiryInput) => (typeof body[key] === "string" ? (body[key] as string) : "");
  const input: EnquiryInput = {
    name: text("name"),
    organisation: text("organisation"),
    role: text("role"),
    phone: text("phone"),
    email: text("email"),
    city: text("city"),
    area: text("area"),
    message: text("message"),
  };

  const errors = validateEnquiry(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "gypsos-website", receivedAt: new Date().toISOString(), ...input }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch {
      return Response.json({ ok: false, error: "We could not send your enquiry right now. Please try again shortly." }, { status: 502 });
    }
  }

  return Response.json({ ok: true, delivered: Boolean(webhook) });
}
