"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/shell";
import { Spinner } from "@/components/portal/ui";
import { authFor, useApi, useFirebaseUser } from "@/lib/portal/client";

export interface AdminStats {
  vendors: number;
  pendingVendors: number;
  kycToReview: number;
  pendingRequests: number;
  invoicesSent: number;
}

const StatsCtx = createContext<{ stats: AdminStats; reload: () => Promise<void> } | null>(null);
export const useAdminStats = () => {
  const ctx = useContext(StatsCtx);
  if (!ctx) throw new Error("useAdminStats must be used inside AdminGate");
  return ctx;
};

export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, ready } = useFirebaseUser("admin");
  const { data, error, reload } = useApi<{ stats: AdminStats }>(user ? "/api/admin/me" : null);

  useEffect(() => {
    if (ready && !user) router.replace("/admin/login");
  }, [ready, user, router]);

  // Signed in but not the admin UID (e.g. a vendor): sign out and send to the admin login.
  useEffect(() => {
    if (error && user) void signOut(authFor("admin")).then(() => router.replace("/admin/login"));
  }, [error, user, router]);

  if (!ready || !user || !data) return <div className="grid min-h-svh place-items-center bg-sand"><Spinner /></div>;

  const s = data.stats;
  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/vendors", label: "Vendors", badge: s.pendingVendors + s.kycToReview },
    { href: "/admin/requests", label: "Stock requests", badge: s.pendingRequests },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/invoices", label: "Invoices" },
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <StatsCtx.Provider value={{ stats: s, reload: async () => void (await reload()) }}>
      <PortalShell role="Admin" nav={nav} loginHref="/admin/login" userLabel={user.email ?? "Admin"}>
        {children}
      </PortalShell>
    </StatsCtx.Provider>
  );
}
