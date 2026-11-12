"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Badge, Btn, Card, Field, Notice, PageHeader, Spinner, Table, TextArea, fmtDate, inputCls } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import { inr } from "@/lib/plaster-estimate";
import type { Product, StockRequest } from "@/lib/portal/types";

export default function VendorRequests() {
  const { data, error, loading, reload } = useApi<{ requests: StockRequest[]; products: Product[] }>("/api/vendor/requests");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const items = Object.entries(qty)
    .map(([productId, q]) => ({ productId, qty: Number(q) }))
    .filter((i) => i.qty > 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/vendor/requests", { body: { items, note } });
      setMsg({ tone: "success", text: "Your stock request has been submitted. GYPSOS will review it and send the invoice." });
      setQty({});
      setNote("");
      await reload();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Could not submit the request." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Stock" title="Request stock">
        Choose the products and quantities you need. After GYPSOS approves and sends the invoice, the stock is added to your inventory automatically.
      </PageHeader>
      {error ? <Notice>{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <div className="space-y-5">
          <Card title="New request">
            <form onSubmit={submit} className="space-y-6" noValidate>
              <Table head={["Product", "Price (per unit)", "Quantity"]}>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>
                      {inr(p.price)} <span className="text-graphite/55">/ {p.unit}</span>
                    </td>
                    <td>
                      <input
                        aria-label={`Quantity of ${p.name} in ${p.unit}s`}
                        inputMode="numeric"
                        placeholder={`No. of ${p.unit}s`}
                        value={qty[p.id] ?? ""}
                        onChange={(e) => setQty((q) => ({ ...q, [p.id]: e.target.value.replace(/\D/g, "") }))}
                        className={`${inputCls} !mt-0 max-w-[160px]`}
                      />
                    </td>
                  </tr>
                ))}
              </Table>
              <p className="text-[12px] text-graphite/55">Prices shown are current rates and may change before your invoice is issued.</p>
              <Field label="Note to GYPSOS (optional)">
                <TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              </Field>
              {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
              <Btn type="submit" busy={busy} disabled={items.length === 0}>
                Submit stock request
              </Btn>
            </form>
          </Card>

          <Card title="My requests">
            <Table head={["Date", "Items", "Status", "Invoice"]} empty={data.requests.length === 0 ? "You have not requested any stock yet." : undefined}>
              {data.requests.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-graphite/60">{fmtDate(r.createdAt)}</td>
                  <td>
                    {r.items.map((i) => (
                      <div key={i.productId}>
                        {i.name} × <strong>{i.qty}</strong>
                      </div>
                    ))}
                    {r.adminNote ? <p className="mt-1 text-[12px] text-graphite/60">GYPSOS: {r.adminNote}</p> : null}
                  </td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                  <td>
                    {r.invoiceId ? (
                      <Link href={`/platform-vendor/invoices/${r.invoiceId}`} className="font-semibold text-ochre-deep underline underline-offset-4">
                        {r.invoiceNumber}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      ) : null}
    </>
  );
}
