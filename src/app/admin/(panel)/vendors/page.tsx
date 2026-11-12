"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, Notice, PageHeader, Spinner, Table, fmtDate } from "@/components/portal/ui";
import { useApi } from "@/lib/portal/client";
import type { Vendor } from "@/lib/portal/types";

const FILTERS = ["all", "pending", "approved", "rejected", "suspended"] as const;

export default function AdminVendors() {
  const { data, error, loading } = useApi<{ vendors: Vendor[] }>("/api/admin/vendors");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const rows = (data?.vendors ?? []).filter((v) => filter === "all" || v.status === filter);

  return (
    <>
      <PageHeader eyebrow="Vendors" title="Vendors & KYC">Approve new registrations and review submitted KYC.</PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${filter === f ? "bg-graphite text-cream" : "border border-graphite/30 hover:bg-graphite/5"}`}
          >
            {f}
          </button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Spinner /> : null}
      {data ? (
        <Card>
          <Table head={["Code", "Business", "Location", "Registration", "KYC", "Registered", ""]} empty={rows.length === 0 ? "No vendors in this view." : undefined}>
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="whitespace-nowrap font-semibold">{v.vendorCode}</td>
                <td>
                  <p className="font-medium">{v.businessName}</p>
                  <p className="text-[12px] text-graphite/60">{v.fullName} · {v.phone}</p>
                </td>
                <td>
                  {v.location}, {v.district}
                </td>
                <td>
                  <Badge value={v.status} />
                </td>
                <td>
                  <Badge value={v.kyc?.status ?? "not_submitted"} />
                </td>
                <td className="whitespace-nowrap text-graphite/60">{fmtDate(v.createdAt)}</td>
                <td>
                  <Link href={`/admin/vendors/${v.id}`} className="font-semibold text-ochre-deep underline underline-offset-4">
                    Review
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
