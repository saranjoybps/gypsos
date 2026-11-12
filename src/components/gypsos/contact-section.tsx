"use client";

import { CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { ScrubIn, WordReveal } from "@/components/motion/scroll-primitives";
import { ENQUIRER_TYPES, validateEnquiry, type EnquiryErrors, type EnquiryInput } from "@/lib/enquiry";

const EMPTY: EnquiryInput = { name: "", organisation: "", role: "", phone: "", email: "", city: "", area: "", message: "" };

type Status = "idle" | "submitting" | "success" | "error";

const field =
  "mt-2 w-full border border-graphite/30 bg-white/70 px-4 py-3.5 text-[15px] text-graphite outline-none transition-colors placeholder:text-graphite/35 focus:border-ochre-deep focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ochre/60 aria-[invalid=true]:border-red-600";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.26em] text-graphite";

export function ContactSection() {
  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof EnquiryInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validateEnquiry(values);
    setErrors(found);
    setServerError("");
    const firstInvalid = (Object.keys(found) as (keyof EnquiryInput)[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: EnquiryErrors; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(EMPTY);
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerError(data.error ?? "Please check the highlighted fields and try again.");
      setStatus("error");
    } catch {
      setServerError("We could not reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const err = (key: keyof EnquiryInput) =>
    errors[key] ? (
      <p id={`err-${key}`} className="mt-1.5 text-[12.5px] font-medium text-red-700">
        {errors[key]}
      </p>
    ) : null;
  const aria = (key: keyof EnquiryInput) => ({ "aria-invalid": errors[key] ? true : undefined, "aria-describedby": errors[key] ? `err-${key}` : undefined }) as const;

  return (
    <section id="contact" className="relative bg-gypsum px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrubIn y={24}>
            <p className="text-[10px] font-medium uppercase tracking-[0.46em] text-ochre-deep">Enquiry</p>
          </ScrubIn>
          <WordReveal text="Let’s plan your next wall." className="mt-5 font-serif text-[clamp(38px,5vw,76px)] font-medium leading-[1.02] text-graphite" />
          <ScrubIn y={24} className="mt-8 max-w-md text-[15px] leading-7 text-ink/80">
            <p>Tell us about your project. We welcome enquiries from the people who build with plaster every day:</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Who we work with">
              {ENQUIRER_TYPES.map((type) => (
                <li key={type} className="border border-graphite/25 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-graphite">
                  {type}
                </li>
              ))}
            </ul>
            <ul className="mt-8 space-y-3" aria-label="Contact details">
              <li>
                <a href="mailto:support@gypsos.in" className="link-underline inline-flex items-center gap-3 text-[15px] font-medium text-graphite">
                  <Mail size={18} strokeWidth={1.4} className="text-ochre-deep" aria-hidden="true" />
                  support@gypsos.in
                </a>
              </li>
              <li>
                <a href="tel:+918489848936" className="link-underline inline-flex items-center gap-3 text-[15px] font-medium text-graphite">
                  <Phone size={18} strokeWidth={1.4} className="text-ochre-deep" aria-hidden="true" />
                  8489848936
                </a>
              </li>
            </ul>
          </ScrubIn>
        </div>

        <ScrubIn y={40}>
          {status === "success" ? (
            <div className="bg-graphite p-10 text-cream sm:p-14" role="status">
              <CheckCircle2 size={36} strokeWidth={1.2} className="text-ochre" aria-hidden="true" />
              <h3 className="mt-6 font-serif text-[clamp(30px,3.4vw,48px)] font-medium leading-tight">Thank you. Your enquiry has been submitted.</h3>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-cream/70">We have received your message and details.</p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-8 border border-cream/40 px-7 py-3 text-[11px] uppercase tracking-[0.26em] transition-colors btn-sweep [--sweep:var(--color-cream)] hover:text-graphite">
                Send another enquiry
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate className="bg-white/60 p-6 sm:p-10" aria-label="Enquiry form">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className={labelCls}>Name *</label>
                  <input id="c-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} className={field} {...aria("name")} />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor="c-org" className={labelCls}>Company / organisation</label>
                  <input id="c-org" name="organisation" autoComplete="organization" value={values.organisation} onChange={set("organisation")} className={field} {...aria("organisation")} />
                  {err("organisation")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="c-role" className={labelCls}>I am a *</label>
                  <select id="c-role" name="role" value={values.role} onChange={set("role")} className={field} {...aria("role")}>
                    <option value="">Select one</option>
                    {ENQUIRER_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {err("role")}
                </div>
                <div>
                  <label htmlFor="c-phone" className={labelCls}>Mobile number *</label>
                  <input id="c-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" value={values.phone} onChange={set("phone")} className={field} {...aria("phone")} />
                  {err("phone")}
                </div>
                <div>
                  <label htmlFor="c-email" className={labelCls}>Email *</label>
                  <input id="c-email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={field} {...aria("email")} />
                  {err("email")}
                </div>
                <div>
                  <label htmlFor="c-city" className={labelCls}>City / project location</label>
                  <input id="c-city" name="city" autoComplete="address-level2" value={values.city} onChange={set("city")} className={field} {...aria("city")} />
                  {err("city")}
                </div>
                <div>
                  <label htmlFor="c-area" className={labelCls}>Approx. area (sq. ft.)</label>
                  <input id="c-area" name="area" inputMode="decimal" value={values.area} onChange={set("area")} className={field} {...aria("area")} />
                  {err("area")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="c-message" className={labelCls}>Your enquiry *</label>
                  <textarea id="c-message" name="message" rows={5} value={values.message} onChange={set("message")} className={`${field} resize-y`} {...aria("message")} />
                  {err("message")}
                </div>
                {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </label>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center gap-3 bg-graphite px-9 py-4 text-[11px] font-medium uppercase tracking-[0.28em] text-cream transition-colors btn-sweep [--sweep:var(--color-ochre-deep)] disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending
                    </>
                  ) : (
                    "Send enquiry"
                  )}
                </button>
                <p className="text-[12px] text-ink/60">* required</p>
              </div>
              {serverError ? (
                <p className="mt-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700" role="alert">
                  {serverError}
                </p>
              ) : null}
            </form>
          )}
        </ScrubIn>
      </div>
    </section>
  );
}
