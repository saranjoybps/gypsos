"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { inr, num } from "@/lib/plaster-estimate";
import { COMPANY } from "@/lib/portal/company";
import type { Invoice } from "@/lib/portal/types";
import { rupeesInWords } from "@/lib/portal/words";
import { fmtDate } from "@/components/portal/ui";

function Party({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="border-b border-graphite/30 pb-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-graphite/60">{title}</p>
      <div className="mt-2.5 space-y-0.5 text-[13px] leading-6">{children}</div>
    </div>
  );
}

/** Printable invoice. "Download PDF" opens the browser's print dialog, where Save as PDF gives an A4 file. */
export function InvoiceView({ invoice, backHref }: { invoice: Invoice; backHref: string }) {
  const taxed = invoice.taxRate > 0;
  const b = invoice.billTo;
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite/70 hover:text-graphite">
          <ArrowLeft size={14} aria-hidden="true" /> Back to invoices
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-graphite px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-ochre-deep"
        >
          <Download size={14} aria-hidden="true" /> Download PDF
        </button>
      </div>

      <article className="invoice-sheet mx-auto max-w-[840px] border border-graphite/15 bg-white p-6 text-graphite sm:p-10 print:max-w-none print:border-0 print:p-0" aria-label={`Invoice ${invoice.invoiceNumber}`}>
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-graphite pb-6">
          <div>
            <p className="font-sans text-[30px] font-extrabold leading-none tracking-[-0.02em]">{COMPANY.brand}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-ochre-deep">{COMPANY.tagline}</p>
            <div className="mt-4 space-y-0.5 text-[12.5px] leading-5 text-graphite/80">
              <p className="font-semibold text-graphite">{COMPANY.name}</p>
              {COMPANY.address ? <p className="max-w-[300px]">{COMPANY.address}</p> : null}
              {COMPANY.gstin ? <p>GSTIN: {COMPANY.gstin}</p> : null}
              {COMPANY.pan ? <p>PAN: {COMPANY.pan}</p> : null}
              <p>
                {COMPANY.email} · {COMPANY.phone}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right print:text-right">
            <p className="font-serif text-[34px] font-medium leading-none">{taxed ? "Tax Invoice" : "Invoice"}</p>
            <dl className="mt-4 space-y-1 text-[13px]">
              <div className="flex gap-3 sm:justify-end print:justify-end">
                <dt className="text-graphite/60">Invoice no.</dt>
                <dd className="font-bold">{invoice.invoiceNumber}</dd>
              </div>
              <div className="flex gap-3 sm:justify-end print:justify-end">
                <dt className="text-graphite/60">Date</dt>
                <dd className="font-semibold">{fmtDate(invoice.date)}</dd>
              </div>
              <div className="flex gap-3 sm:justify-end print:justify-end">
                <dt className="text-graphite/60">Vendor code</dt>
                <dd className="font-semibold">{invoice.vendorCode}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mt-7 grid gap-7 sm:grid-cols-2">
          <Party title="Bill to">
            <p className="font-semibold">{b.name}</p>
            <p>Attn: {b.contact}</p>
            <p className="text-graphite/80">{b.address}</p>
            {b.gstin ? <p>GSTIN: {b.gstin}</p> : null}
            {b.pan ? <p>PAN: {b.pan}</p> : null}
            <p className="text-graphite/80">
              {b.phone} · {b.email}
            </p>
          </Party>
          <Party title="Deliver to">
            <p className="font-semibold">{b.name}</p>
            <p className="text-graphite/80">{invoice.deliveryAddress}</p>
            <p className="text-graphite/80">Contact: {b.contact}, {b.phone}</p>
          </Party>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-[12.5px] sm:text-[13px]">
            <thead>
              <tr className="bg-graphite text-left text-[10px] uppercase tracking-[0.2em] text-cream print:bg-graphite">
                <th className="px-3 py-2.5 font-semibold">#</th>
                <th className="px-3 py-2.5 font-semibold">Description</th>
                <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
                <th className="px-3 py-2.5 text-right font-semibold">Rate</th>
                <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((i, idx) => (
                <tr key={i.productId} className="border-b border-graphite/15">
                  <td className="px-3 py-3 text-graphite/60">{idx + 1}</td>
                  <td className="px-3 py-3 font-medium">{i.name}</td>
                  <td className="px-3 py-3 text-right">
                    {num(i.qty)} {i.unit}
                    {i.qty === 1 ? "" : "s"}
                  </td>
                  <td className="px-3 py-3 text-right">{inr(i.rate)}</td>
                  <td className="px-3 py-3 text-right font-medium">{inr(i.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_280px]">
          <div className="text-[12.5px] leading-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-graphite/60">Amount in words</p>
            <p className="mt-1.5 font-semibold">{rupeesInWords(invoice.total)}</p>
            {invoice.notes ? (
              <>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.26em] text-graphite/60">Notes</p>
                <p className="mt-1.5 whitespace-pre-line text-graphite/80">{invoice.notes}</p>
              </>
            ) : null}
            {COMPANY.bankDetails ? (
              <>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.26em] text-graphite/60">Bank details</p>
                <p className="mt-1.5 whitespace-pre-line text-graphite/80">{COMPANY.bankDetails}</p>
              </>
            ) : null}
          </div>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-graphite/70">Subtotal</dt>
              <dd>{inr(invoice.subtotal)}</dd>
            </div>
            {taxed ? (
              <div className="flex justify-between">
                <dt className="text-graphite/70">GST @ {invoice.taxRate}%</dt>
                <dd>{inr(invoice.taxAmount)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between border-t-2 border-graphite pt-3">
              <dt className="text-[11px] font-bold uppercase tracking-[0.22em]">Total</dt>
              <dd className="font-serif text-[28px] font-semibold leading-none">{inr(invoice.total)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-graphite/20 pt-5 text-[11.5px] leading-5 text-graphite/65">
          <p className="max-w-[360px]">This is a computer-generated invoice. Goods are supplied in bags. Please check the quantity on delivery and quote the invoice number in any query.</p>
          <div className="text-right">
            <p className="font-semibold text-graphite">For {COMPANY.name}</p>
            <p className="mt-8">Authorised signatory</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
