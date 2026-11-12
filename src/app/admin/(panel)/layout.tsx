import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminGate } from "@/components/portal/admin-gate";

export const metadata: Metadata = { title: "Admin portal | GYPSOS", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
