"use client";

import { useState } from "react";
import { Btn, Card, Notice, PageHeader, Spinner, Table, TextInput } from "@/components/portal/ui";
import { api, useApi } from "@/lib/portal/client";
import type { Product } from "@/lib/portal/types";

function ProductRow({ p, onSaved }: { p: Product; onSaved: () => Promise<void> }) {
  const [price, setPrice] = useState(String(p.price));
  const [active, setActive] = useState(p.active);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = Number(price) !== p.price || active !== p.active;

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      await api("/api/admin/products", { method: "PUT", body: { id: p.id, price: Number(price), active } });
      setMsg("Saved");
      await onSaved();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td data-label="Product" className="font-medium">{p.name}</td>
      <td data-label="Unit" className="capitalize">{p.unit}</td>
      <td data-label="Price per unit">
        <div className="flex items-center gap-2">
          <span className="text-graphite/60">₹</span>
          <TextInput aria-label={`Price of ${p.name}`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} className="!mt-0 !w-[120px] !py-2" />
        </div>
      </td>
      <td data-label="Status">
        <label className="inline-flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#a86a22]" /> Available
        </label>
      </td>
      <td data-label="">
        <div className="flex items-center gap-3">
          <Btn busy={busy} disabled={!dirty} onClick={save} className="!px-4 !py-2">
            Save
          </Btn>
          {msg ? <span className="text-[12px] text-graphite/65">{msg}</span> : null}
        </div>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const { data, error, loading, reload } = useApi<{ products: Product[] }>("/api/admin/products");
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Products & prices">Both products are sold by the bag. Prices here are used on new invoices and shown to vendors when they request stock.</PageHeader>
      <div className="mb-5">
        <Notice tone="info">Default prices are placeholders. Set the real rates here before sending invoices.</Notice>
      </div>
      {error ? <Notice>{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <Card>
          <Table head={["Product", "Unit", "Price per unit", "Status", ""]}>
            {data.products.map((p) => (
              <ProductRow key={`${p.id}-${p.price}-${p.active}`} p={p} onSaved={async () => void (await reload())} />
            ))}
          </Table>
        </Card>
      ) : null}
    </>
  );
}
