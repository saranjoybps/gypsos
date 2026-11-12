"use client";

import { useState, type FormEvent } from "react";
import { useVendor } from "@/components/portal/vendor-gate";
import { Badge, Btn, Card, Field, Notice, PageHeader, Select, TextInput } from "@/components/portal/ui";
import { ApiFail, api } from "@/lib/portal/client";
import type { KycData } from "@/lib/portal/types";
import { BUSINESS_TYPES, EMPTY_KYC } from "@/lib/portal/validation";

export default function VendorKyc() {
  const { vendor, reload } = useVendor();
  const kyc = vendor.kyc;
  const locked = kyc?.status === "verified" || kyc?.status === "submitted";
  const [v, setV] = useState<KycData>({ ...EMPTY_KYC, ...(kyc?.data ?? {}) });
  const [errors, setErrors] = useState<Partial<Record<keyof KycData, string>>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const set = (k: keyof KycData) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));
  const upper = (k: keyof KycData) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value.toUpperCase() }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErrors({});
    try {
      await api("/api/vendor/kyc", { method: "PUT", body: v });
      setMsg({ tone: "success", text: "KYC submitted. GYPSOS will review and verify it." });
      await reload();
    } catch (err) {
      if (err instanceof ApiFail) setErrors((err.fields ?? {}) as Partial<Record<keyof KycData, string>>);
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Could not submit KYC." });
    } finally {
      setBusy(false);
    }
  }

  const text = (k: keyof KycData, label: string, extra: { onChange?: typeof set; placeholder?: string; maxLength?: number; hint?: string } = {}) => (
    <Field label={label} error={errors[k]} hint={extra.hint}>
      <TextInput value={v[k]} onChange={(extra.onChange ?? set)(k)} error={errors[k]} disabled={locked} placeholder={extra.placeholder} maxLength={extra.maxLength} />
    </Field>
  );

  return (
    <>
      <PageHeader eyebrow="Verification" title="KYC details">Fill in your business and bank details. No documents are needed for now. GYPSOS reviews and verifies them.</PageHeader>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.22em] text-graphite/60">Status</span>
        <Badge value={kyc?.status ?? "not_submitted"} />
      </div>
      {kyc?.status === "rejected" && kyc.remarks ? <div className="mb-5"><Notice>GYPSOS asked for changes: {kyc.remarks}</Notice></div> : null}
      {kyc?.status === "submitted" ? <div className="mb-5"><Notice tone="info">Your KYC is with GYPSOS for review. You will see the result here.</Notice></div> : null}
      {kyc?.status === "verified" ? <div className="mb-5"><Notice tone="success">Your KYC is verified.</Notice></div> : null}

      <form onSubmit={submit} noValidate className="space-y-5">
        <Card title="Business">
          <div className="grid gap-5 sm:grid-cols-2">
            {text("legalName", "Legal business name")}
            <Field label="Business type" error={errors.businessType}>
              <Select value={v.businessType} onChange={set("businessType")} error={errors.businessType} disabled={locked}>
                <option value="">Select</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            {text("panNumber", "PAN number", { onChange: upper, placeholder: "ABCDE1234F", maxLength: 10 })}
            {text("gstin", "GSTIN (if registered)", { onChange: upper, placeholder: "15 characters", maxLength: 15, hint: "Leave blank if you are not GST registered." })}
            {text("signatoryName", "Authorised signatory")}
          </div>
        </Card>
        <Card title="Bank account">
          <div className="grid gap-5 sm:grid-cols-2">
            {text("bankAccountName", "Account holder name")}
            {text("bankAccountNumber", "Account number", { maxLength: 18 })}
            {text("ifsc", "IFSC code", { onChange: upper, placeholder: "HDFC0001234", maxLength: 11 })}
            {text("bankName", "Bank name")}
            {text("bankBranch", "Branch")}
          </div>
        </Card>
        {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        {!locked ? (
          <Btn type="submit" busy={busy}>
            {kyc?.status === "rejected" ? "Resubmit KYC" : "Submit KYC"}
          </Btn>
        ) : null}
      </form>
    </>
  );
}
