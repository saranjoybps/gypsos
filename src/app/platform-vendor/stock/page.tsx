"use client";

import { useState, type FormEvent } from "react";
import { Badge, Btn, Card, Field, Notice, PageHeader, Select, Spinner, Table, TextInput, fmtDateTime } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import type { StockMovement, StockRow } from "@/lib/portal/types";

export default function VendorStock() {
  const { data, error, loading, reload } = useApi<{ stock: StockRow[]; movements: StockMovement[] }>("/api/vendor/stock");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const selected = data?.stock.find((s) => s.productId === productId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await api<{ balance: number }>("/api/vendor/stock", { body: { productId, qty: Number(qty), note } });
      setMsg({ tone: "success", text: `Stock updated. ${selected?.name ?? "Product"} balance is now ${res.balance}.` });
      setQty("");
      setNote("");
      await reload();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Could not update stock." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Inventory" title="My stock">
        Stock is added automatically when GYPSOS sends an invoice. Record what you sell here to keep your balance correct.
      </PageHeader>
      {error ? <Notice>{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <Card title="Current stock">
            <Table head={["Product", "In stock", "Last updated"]}>
              {data.stock.map((s) => (
                <tr key={s.productId}>
                  <td className="font-medium">{s.name}</td>
                  <td>
                    <span className="font-serif text-[26px]">{s.qty}</span> <span className="text-graphite/55">{s.unit}s</span>
                  </td>
                  <td className="text-graphite/60">{fmtDateTime(s.updatedAt)}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Record a sale (reduce stock)">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <Field label="Product">
                <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">Select a product</option>
                  {data.stock.map((s) => (
                    <option key={s.productId} value={s.productId}>
                      {s.name} ({s.qty} in stock)
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Quantity sold" hint={selected ? `Up to ${selected.qty} ${selected.unit}s available.` : undefined}>
                <TextInput inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 10" />
              </Field>
              <Field label="Note (optional)">
                <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sold to site, Anna Nagar" maxLength={300} />
              </Field>
              {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
              <Btn type="submit" busy={busy} disabled={!productId || !qty || Number(qty) <= 0}>
                Reduce stock
              </Btn>
            </form>
          </Card>

          <Card title="Stock history" className="xl:col-span-2">
            <Table head={["Date", "Product", "Change", "Balance", "Source", "Note"]} empty={data.movements.length === 0 ? "No stock movements yet." : undefined}>
              {data.movements.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap text-graphite/60">{fmtDateTime(m.at)}</td>
                  <td>{m.productName}</td>
                  <td>
                    <Badge value={m.type} label={`${m.type === "in" ? "+" : "-"}${m.qty}`} />
                  </td>
                  <td>{m.balanceAfter}</td>
                  <td className="capitalize">{m.source}</td>
                  <td className="text-graphite/65">{m.note || "-"}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      ) : null}
    </>
  );
}
