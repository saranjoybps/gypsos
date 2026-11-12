"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Badge, Btn, Card, Field, Notice, PageHeader, Select, Spinner, Table, TextInput, fmtDateTime } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import type { StockMovement, StockRow, Vendor } from "@/lib/portal/types";

interface Overview {
  vendors: { id: string; vendorCode: string; businessName: string; stock: StockRow[] }[];
}
interface Detail {
  vendor: Vendor;
  stock: StockRow[];
  movements: StockMovement[];
}

function Inventory() {
  const params = useSearchParams();
  const [vendorId, setVendorId] = useState(params.get("vendorId") ?? "");
  const overview = useApi<Overview>("/api/admin/inventory");
  const detail = useApi<Detail>(vendorId ? `/api/admin/inventory?vendorId=${vendorId}` : null);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const selected = detail.data?.stock.find((s) => s.productId === productId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await api<{ balance: number }>("/api/admin/inventory", { body: { vendorId, productId, qty: Number(qty), note: note || "Reduced by admin" } });
      setMsg({ tone: "success", text: `Stock reduced. New balance: ${res.balance}.` });
      setQty("");
      setNote("");
      await Promise.all([detail.reload(), overview.reload()]);
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Could not reduce stock." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Vendor inventory">See every vendor&rsquo;s stock. If a vendor cannot record their own sales, reduce their stock directly here.</PageHeader>
      {overview.error ? <Notice>{overview.error}</Notice> : null}
      {overview.loading && !overview.data ? <Spinner /> : null}

      {overview.data ? (
        <Card title="All vendors" className="mb-5">
          <Table head={["Vendor", ...(overview.data.vendors[0]?.stock.map((s) => s.name) ?? []), ""]} empty={overview.data.vendors.length === 0 ? "No approved vendors yet." : undefined}>
            {overview.data.vendors.map((v) => (
              <tr key={v.id} className={v.id === vendorId ? "bg-ochre/10" : ""}>
                <td>
                  <p className="font-semibold">{v.vendorCode}</p>
                  <p className="text-[12px] text-graphite/60">{v.businessName}</p>
                </td>
                {v.stock.map((s) => (
                  <td key={s.productId} className="font-serif text-[22px]">
                    {s.qty}
                  </td>
                ))}
                <td>
                  <button type="button" onClick={() => { setVendorId(v.id); setMsg(null); setProductId(""); }} className="font-semibold text-ochre-deep underline underline-offset-4">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : null}

      {vendorId ? (
        detail.loading && !detail.data ? (
          <Spinner />
        ) : detail.error || !detail.data ? (
          <Notice>{detail.error || "Could not load this vendor."}</Notice>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <Card title={`${detail.data.vendor.vendorCode} · ${detail.data.vendor.businessName}`}>
              <Table head={["Product", "In stock"]}>
                {detail.data.stock.map((s) => (
                  <tr key={s.productId}>
                    <td className="font-medium">{s.name}</td>
                    <td>
                      <span className="font-serif text-[24px]">{s.qty}</span> <span className="text-graphite/55">{s.unit}s</span>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
            <Card title="Reduce stock (admin)">
              <form onSubmit={submit} className="space-y-5" noValidate>
                <Field label="Product">
                  <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                    <option value="">Select a product</option>
                    {detail.data.stock.map((s) => (
                      <option key={s.productId} value={s.productId}>
                        {s.name} ({s.qty} in stock)
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Quantity to reduce" hint={selected ? `Up to ${selected.qty} ${selected.unit}s available.` : undefined}>
                  <TextInput inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} />
                </Field>
                <Field label="Reason">
                  <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Vendor sale reported by phone" maxLength={300} />
                </Field>
                {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
                <Btn type="submit" busy={busy} disabled={!productId || !qty || Number(qty) <= 0}>
                  Reduce stock
                </Btn>
              </form>
            </Card>
            <Card title="Stock history" className="xl:col-span-2">
              <Table head={["Date", "Product", "Change", "Balance", "Source", "Note"]} empty={detail.data.movements.length === 0 ? "No stock movements yet." : undefined}>
                {detail.data.movements.map((m) => (
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
        )
      ) : null}
    </>
  );
}

export default function AdminInventory() {
  return (
    <Suspense fallback={<Spinner />}>
      <Inventory />
    </Suspense>
  );
}
