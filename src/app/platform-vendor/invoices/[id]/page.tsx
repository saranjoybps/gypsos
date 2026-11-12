"use client";

import { use } from "react";
import { InvoiceView } from "@/components/portal/invoice-view";
import { Notice, Spinner } from "@/components/portal/ui";
import { useApi } from "@/lib/portal/client";
import type { Invoice } from "@/lib/portal/types";

export default function VendorInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useApi<{ invoice: Invoice }>(`/api/vendor/invoices/${id}`);
  if (loading) return <Spinner />;
  if (error || !data) return <Notice>{error || "Invoice not found."}</Notice>;
  return <InvoiceView invoice={data.invoice} backHref="/platform-vendor/invoices" />;
}
