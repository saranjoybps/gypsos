"use client";

import Link from "next/link";
import { Card, Notice, PageHeader, Spinner, Table, fmtDate } from "@/components/portal/ui";
import { useApi } from "@/lib/portal/client";
import { inr } from "@/lib/plaster-estimate";
import type { Invoice } from "@/lib/portal/types";

export default function AdminInvoices() {
  const { data, error, loading } = useApi<{ invoices: Invoice[] }>("/api/admin/invoices");
  return (
    <>
      <PageHeader eyebrow="Billing" title="Invoices">Every invoice sent to vendors.</PageHeader>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Spinner /> : null}
      {data ? (
        <Card>
          <Table head={["Invoice no.", "Date", "Vendor", "Items", "Total", ""]} empty={data.invoices.length === 0 ? "No invoices sent yet." : undefined}>
            {data.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-semibold">{inv.invoiceNumber}</td>
                <td className="whitespace-nowrap text-graphite/60">{fmtDate(inv.date)}</td>
                <td>
                  {inv.vendorCode}
                  <p className="text-[12px] text-graphite/60">{inv.billTo.name}</p>
                </td>
                <td>{inv.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</td>
                <td className="font-medium">{inr(inv.total)}</td>
                <td>
                  <Link href={`/admin/invoices/${inv.id}`} className="font-semibold text-ochre-deep underline underline-offset-4">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : null}
    </>
  );
}
