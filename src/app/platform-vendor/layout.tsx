import type { Metadata } from "next";
import type { ReactNode } from "react";
import { VendorGate } from "@/components/portal/vendor-gate";

export const metadata: Metadata = { title: "Vendor portal | GYPSOS", robots: { index: false, follow: false } };

export default function VendorLayout({ children }: { children: ReactNode }) {
  return <VendorGate>{children}</VendorGate>;
}
