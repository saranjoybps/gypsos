"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useAdminStats } from "@/components/portal/admin-gate";
import { Badge, Btn, Card, Field, Notice, PageHeader, Spinner, TextInput } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import type { Vendor } from "@/lib/portal/types";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1 border-b border-graphite/10 py-2.5 text-[13px] sm:grid-cols-[180px_minmax(0,1fr)]">
      <dt className="text-graphite/60">{label}</dt>
      <dd className="break-words font-medium">{value || "-"}</dd>
    </div>
  );
}

export default function AdminVendorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { reload: reloadStats } = useAdminStats();
  const { data, error, loading, reload } = useApi<{ vendor: Vendor }>(`/api/admin/vendors/${id}`);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function act(action: string, success: string) {
    setBusy(action);
    setMsg(null);
    try {
      await api(`/api/admin/vendors/${id}`, { method: "PATCH", body: { action, note } });
      setMsg({ tone: "success", text: success });
      setNote("");
      await Promise.all([reload(), reloadStats()]);
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Action failed." });
    } finally {
      setBusy("");
    }
  }

  if (loading && !data) return <Spinner />;
  if (error || !data) return <Notice>{error || "Vendor not found."}</Notice>;
  const v = data.vendor;
  const k = v.kyc;

  return (
    <>
      <Link href="/admin/vendors" className="mb-5 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite/70 hover:text-graphite">
        ← All vendors
      </Link>
      <PageHeader eyebrow={v.vendorCode} title={v.businessName}>
        <Badge value={v.status} /> <span className="ml-2" /> KYC <Badge value={k?.status ?? "not_submitted"} />
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Personal & business details">
          <dl>
            <Row label="Full name" value={v.fullName} />
            <Row label="Mobile" value={v.phone} />
            <Row label="Email" value={v.email} />
            <Row label="Business address" value={v.address} />
            <Row label="Location" value={v.location} />
            <Row label="District" value={v.district} />
            <Row label="State / Pincode" value={`${v.state} - ${v.pincode}`} />
            <Row label="Delivery address" value={v.deliveryAddress || "Same as business address"} />
          </dl>
        </Card>

        <Card title="KYC details">
          {k?.status === "not_submitted" || !k ? (
            <p className="text-[13px] text-graphite/60">The vendor has not submitted KYC yet.</p>
          ) : (
            <dl>
              <Row label="Legal name" value={k.data.legalName} />
              <Row label="Business type" value={k.data.businessType} />
              <Row label="PAN" value={k.data.panNumber} />
              <Row label="GSTIN" value={k.data.gstin} />
              <Row label="Signatory" value={k.data.signatoryName} />
              <Row label="Account holder" value={k.data.bankAccountName} />
              <Row label="Account number" value={k.data.bankAccountNumber} />
              <Row label="IFSC" value={k.data.ifsc} />
              <Row label="Bank / Branch" value={`${k.data.bankName} / ${k.data.bankBranch}`} />
              {k.remarks ? <Row label="Remarks" value={k.remarks} /> : null}
            </dl>
          )}
        </Card>
      </div>

      <Card title="Decisions" className="mt-5">
        <div className="max-w-xl space-y-4">
          <Field label="Note / reason" hint="Required when rejecting. Shown to the vendor.">
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} />
          </Field>
          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
          <div className="flex flex-wrap gap-3">
            {v.status === "pending" || v.status === "rejected" ? (
              <Btn variant="ochre" busy={busy === "approve"} onClick={() => act("approve", "Vendor approved. They can now sign in to the portal.")}>
                Approve registration
              </Btn>
            ) : null}
            {v.status === "pending" ? (
              <Btn variant="danger" busy={busy === "reject"} onClick={() => act("reject", "Registration rejected.")}>
                Reject registration
              </Btn>
            ) : null}
            {v.status === "approved" ? (
              <Btn variant="danger" busy={busy === "suspend"} onClick={() => act("suspend", "Vendor suspended.")}>
                Suspend vendor
              </Btn>
            ) : null}
            {v.status === "suspended" ? (
              <Btn variant="ochre" busy={busy === "reinstate"} onClick={() => act("reinstate", "Vendor reinstated.")}>
                Reinstate vendor
              </Btn>
            ) : null}
            {k?.status === "submitted" ? (
              <>
                <Btn busy={busy === "kyc_verify"} onClick={() => act("kyc_verify", "KYC marked as verified.")}>
                  Verify KYC
                </Btn>
                <Btn variant="danger" busy={busy === "kyc_reject"} onClick={() => act("kyc_reject", "KYC sent back to the vendor for changes.")}>
                  Reject KYC
                </Btn>
              </>
            ) : null}
            {v.status === "approved" ? (
              <Link href={`/admin/inventory?vendorId=${v.id}`} className="inline-flex items-center border border-graphite/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-graphite hover:text-cream">
                View inventory
              </Link>
            ) : null}
          </div>
        </div>
      </Card>
    </>
  );
}
