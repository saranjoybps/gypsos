import nodemailer from "nodemailer";
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

  const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (smtpReady) {
    try {
      await sendEnquiryEmail(input);
    } catch (error) {
      console.error("Enquiry email failed:", error instanceof Error ? error.message : "unknown error");
      return Response.json({ ok: false, error: "We could not send your enquiry right now. Please try again shortly." }, { status: 502 });
    }
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

  return Response.json({ ok: true, delivered: smtpReady || Boolean(webhook) });
}

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

/** Sends the enquiry to the GYPSOS inbox over SMTP (Zoho, STARTTLS on 587). Credentials come from server env only. */
async function sendEnquiryEmail(input: EnquiryInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const rows: [string, string][] = [
    ["Name", input.name],
    ["Organisation", input.organisation],
    ["Role", input.role],
    ["Mobile", input.phone],
    ["Email", input.email],
    ["City", input.city],
    ["Area (sq. ft.)", input.area],
    ["Message", input.message],
  ];
  const filled = rows.filter(([, v]) => v.trim() !== "");

  await transporter.sendMail({
    from: `"GYPSOS Website" <${process.env.SMTP_USER}>`,
    to: process.env.ENQUIRY_TO ?? process.env.SMTP_USER,
    replyTo: oneLine(input.email),
    subject: `New website enquiry from ${oneLine(input.name)}`,
    text: filled.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${filled
      .map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${esc(k)}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("")}</table>`,
  });
}
