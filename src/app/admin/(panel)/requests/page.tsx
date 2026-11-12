"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminStats } from "@/components/portal/admin-gate";
import { Badge, Btn, Card, Field, Notice, PageHeader, Spinner, TextInput, fmtDateTime } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import { COMPANY } from "@/lib/portal/company";
import type { StockRequest } from "@/lib/portal/types";

function RequestCard({ r, onDone }: { r: StockRequest; onDone: () => Promise<void> }) {
  const [note, setNote] = useState("");
  const [tax, setTax] = useState(String(COMPANY.defaultGstRate));
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const open = r.status === "pending" || r.status === "approved";

  async function act(action: "approve" | "reject" | "send") {
    setBusy(action);
    setMsg(null);
    try {
      const res = await api<{ invoiceNumber?: string }>(`/api/admin/requests/${r.id}`, { method: "PATCH", body: { action, note, taxRate: Number(tax || 0), invoiceNotes } });
      setMsg({ tone: "success", text: action === "send" ? `Invoice ${res.invoiceNumber} sent and the vendor's stock has been updated.` : action === "approve" ? "Request approved." : "Request rejected." });
      await onDone();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Action failed." });
    } finally {
      setBusy("");
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/55">
            {r.vendorCode} · {fmtDateTime(r.createdAt)}
          </p>
          <Link href={`/admin/vendors/${r.vendorId}`} className="mt-1 inline-block font-serif text-[22px] font-medium underline-offset-4 hover:underline">
            {r.vendorName}
          </Link>
        </div>
        <Badge value={r.status} />
      </div>
      <ul className="mt-4 space-y-1 text-[14px]">
        {r.items.map((i) => (
          <li key={i.productId}>
            {i.name} × <strong>{i.qty}</strong> {i.unit}s
          </li>
        ))}
      </ul>
      {r.note ? <p className="mt-3 text-[13px] text-graphite/70">Vendor note: {r.note}</p> : null}
      {r.adminNote ? <p className="mt-1 text-[13px] text-graphite/70">Your note: {r.adminNote}</p> : null}
      {r.invoiceId ? (
        <Link href={`/admin/invoices/${r.invoiceId}`} className="mt-3 inline-block font-semibold text-ochre-deep underline underline-offset-4">
          Invoice {r.invoiceNumber}
        </Link>
      ) : null}

      {open ? (
        <div className="mt-5 space-y-4 border-t border-graphite/15 pt-5">
          <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
            <Field label="GST %">
              <TextInput inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value.replace(/[^\d.]/g, ""))} />
            </Field>
            <Field label="Invoice notes (optional)">
              <TextInput value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} maxLength={500} />
            </Field>
          </div>
          <Field label="Note to vendor (required to reject)">
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} />
          </Field>
          {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
          <div className="flex flex-wrap gap-3">
            <Btn variant="ochre" busy={busy === "send"} onClick={() => act("send")}>
              Send invoice &amp; update stock
            </Btn>
            {r.status === "pending" ? (
              <Btn variant="ghost" busy={busy === "approve"} onClick={() => act("approve")}>
                Approve only
              </Btn>
            ) : null}
            <Btn variant="danger" busy={busy === "reject"} onClick={() => act("reject")}>
              Reject
            </Btn>
          </div>
          <p className="text-[12px] text-graphite/55">Sending the invoice marks the request as sent and adds these quantities to the vendor&rsquo;s stock immediately.</p>
        </div>
      ) : null}
    </Card>
  );
}

export default function AdminRequests() {
  const { reload: reloadStats } = useAdminStats();
  const { data, error, loading, reload } = useApi<{ requests: StockRequest[] }>("/api/admin/requests");
  const [tab, setTab] = useState<"open" | "done">("open");
  const done = async () => void (await Promise.all([reload(), reloadStats()]));
  const rows = (data?.requests ?? []).filter((r) => (tab === "open" ? r.status === "pending" || r.status === "approved" : r.status === "sent" || r.status === "rejected"));

  return (
    <>
      <PageHeader eyebrow="Stock" title="Stock requests">Review vendor requests, then approve and send the invoice. The vendor&rsquo;s inventory updates automatically when the invoice is sent.</PageHeader>
      <div className="mb-4 flex gap-2">
        {(["open", "done"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${tab === t ? "bg-graphite text-cream" : "border border-graphite/30 hover:bg-graphite/5"}`}>
            {t === "open" ? "To action" : "Completed"}
          </button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      <div className="space-y-4">
        {rows.map((r) => (
          <RequestCard key={`${r.id}-${r.status}`} r={r} onDone={done} />
        ))}
        {data && rows.length === 0 ? <p className="py-8 text-center text-[13px] text-graphite/55">{tab === "open" ? "No requests waiting." : "Nothing here yet."}</p> : null}
      </div>
    </>
  );
}
