"use client";

import Link from "next/link";
import { useVendor } from "@/components/portal/vendor-gate";
import { Badge, Card, PageHeader, Spinner, Table } from "@/components/portal/ui";
import { useApi } from "@/lib/portal/client";
import type { StockRequest, StockRow } from "@/lib/portal/types";

export default function VendorDashboard() {
  const { vendor } = useVendor();
  const stock = useApi<{ stock: StockRow[] }>("/api/vendor/stock");
  const reqs = useApi<{ requests: StockRequest[] }>("/api/vendor/requests");
  const open = reqs.data?.requests.filter((r) => r.status === "pending" || r.status === "approved").length ?? 0;

  return (
    <>
      <PageHeader eyebrow={`Vendor code ${vendor.vendorCode}`} title={`Welcome, ${vendor.fullName.split(" ")[0]}`}>
        {vendor.businessName} · {vendor.location}, {vendor.district}
      </PageHeader>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="KYC">
          <Badge value={vendor.kyc?.status ?? "not_submitted"} />
          <p className="mt-3 text-[13px] leading-6 text-graphite/70">
            {vendor.kyc?.status === "verified" ? "Your KYC is verified." : vendor.kyc?.status === "submitted" ? "Submitted. GYPSOS is reviewing it." : vendor.kyc?.status === "rejected" ? `Needs changes: ${vendor.kyc.remarks}` : "Please complete your KYC details."}
          </p>
          {vendor.kyc?.status !== "verified" && vendor.kyc?.status !== "submitted" ? (
            <Link href="/platform-vendor/kyc" className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-deep underline underline-offset-4">
              {vendor.kyc?.status === "rejected" ? "Update KYC" : "Complete KYC"}
            </Link>
          ) : null}
        </Card>
        <Card title="Open requests">
          <p className="font-serif text-[44px] leading-none">{reqs.loading ? "…" : open}</p>
          <Link href="/platform-vendor/requests" className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-deep underline underline-offset-4">
            Request stock
          </Link>
        </Card>
        <Card title="Invoices">
          <p className="font-serif text-[44px] leading-none">{reqs.loading ? "…" : reqs.data?.requests.filter((r) => r.status === "sent").length ?? 0}</p>
          <Link href="/platform-vendor/invoices" className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-deep underline underline-offset-4">
            View invoices
          </Link>
        </Card>
      </div>

      <Card title="Current stock" className="mt-5" action={<Link href="/platform-vendor/stock" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-deep underline underline-offset-4">Manage</Link>}>
        {stock.loading ? (
          <Spinner />
        ) : (
          <Table head={["Product", "In stock"]}>
            {stock.data?.stock.map((s) => (
              <tr key={s.productId}>
                <td className="font-medium">{s.name}</td>
                <td>
                  <span className="font-serif text-[24px]">{s.qty}</span> <span className="text-graphite/55">{s.unit}s</span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
