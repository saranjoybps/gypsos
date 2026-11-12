"use client";

import Link from "next/link";
import { useAdminStats } from "@/components/portal/admin-gate";
import { Card, PageHeader } from "@/components/portal/ui";

export default function AdminOverview() {
  const { stats } = useAdminStats();
  const tiles = [
    { label: "Registrations to approve", value: stats.pendingVendors, href: "/admin/vendors", cta: "Review vendors" },
    { label: "KYC to review", value: stats.kycToReview, href: "/admin/vendors", cta: "Review KYC" },
    { label: "Stock requests to action", value: stats.pendingRequests, href: "/admin/requests", cta: "Open requests" },
    { label: "Invoices sent", value: stats.invoicesSent, href: "/admin/invoices", cta: "View invoices" },
    { label: "Total vendors", value: stats.vendors, href: "/admin/vendors", cta: "All vendors" },
  ];
  return (
    <>
      <PageHeader eyebrow="Admin" title="Overview">What needs your attention across vendors, stock requests and invoices.</PageHeader>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-graphite/60">{t.label}</p>
            <p className="mt-3 font-serif text-[52px] leading-none">{t.value}</p>
            <Link href={t.href} className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-deep underline underline-offset-4">
              {t.cta}
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
