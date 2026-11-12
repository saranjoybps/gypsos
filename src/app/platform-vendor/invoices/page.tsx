"use client";

import Link from "next/link";
import { Card, Notice, PageHeader, Spinner, Table, fmtDate } from "@/components/portal/ui";
import { useApi } from "@/lib/portal/client";
import { inr } from "@/lib/plaster-estimate";
import type { Invoice } from "@/lib/portal/types";

export default function VendorInvoices() {
  const { data, error, loading } = useApi<{ invoices: Invoice[] }>("/api/vendor/invoices");
  return (
    <>
      <PageHeader eyebrow="Billing" title="Invoices">Invoices sent by GYPSOS. Open one to view it or save it as a PDF.</PageHeader>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Spinner /> : null}
      {data ? (
        <Card>
          <Table head={["Invoice no.", "Date", "Items", "Total", ""]} empty={data.invoices.length === 0 ? "No invoices yet. They appear here once GYPSOS sends one." : undefined}>
            {data.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-semibold">{inv.invoiceNumber}</td>
                <td className="text-graphite/60">{fmtDate(inv.date)}</td>
                <td>{inv.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</td>
                <td className="font-medium">{inr(inv.total)}</td>
                <td>
                  <Link href={`/platform-vendor/invoices/${inv.id}`} className="font-semibold text-ochre-deep underline underline-offset-4">
                    View / download
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
