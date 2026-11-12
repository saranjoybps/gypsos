"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/shell";
import { Btn, Notice, Spinner } from "@/components/portal/ui";
import { authFor, useApi, useFirebaseUser } from "@/lib/portal/client";
import type { Vendor } from "@/lib/portal/types";

const VendorCtx = createContext<{ vendor: Vendor; reload: () => Promise<void> } | null>(null);
export const useVendor = () => {
  const ctx = useContext(VendorCtx);
  if (!ctx) throw new Error("useVendor must be used inside VendorGate");
  return ctx;
};

const NAV = [
  { href: "/platform-vendor", label: "Dashboard" },
  { href: "/platform-vendor/stock", label: "My stock" },
  { href: "/platform-vendor/requests", label: "Stock requests" },
  { href: "/platform-vendor/invoices", label: "Invoices" },
  { href: "/platform-vendor/kyc", label: "KYC" },
];

export function VendorGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, ready } = useFirebaseUser("vendor");
  const { data, error, loading, reload } = useApi<{ vendor: Vendor }>(user ? "/api/vendor/me" : null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const out = async () => {
    await signOut(authFor("vendor"));
    router.replace("/login");
  };

  if (!ready || !user || loading) return <div className="grid min-h-svh place-items-center bg-sand"><Spinner /></div>;

  if (error || !data) {
    return (
      <Screen>
        <Notice>{error || "Could not load your account."}</Notice>
        <Btn className="mt-6" onClick={out}>Sign out</Btn>
      </Screen>
    );
  }

  const { vendor } = data;
  if (vendor.status !== "approved") {
    const msg = {
      pending: "Your registration is awaiting approval from GYPSOS. You will be able to use the portal as soon as it is approved.",
      rejected: "Your registration was not approved.",
      suspended: "Your vendor account is currently suspended.",
    }[vendor.status];
    return (
      <Screen>
        <p className="text-[10px] uppercase tracking-[0.4em] text-ochre-deep">Vendor code {vendor.vendorCode}</p>
        <h1 className="mt-3 font-serif text-[32px] font-medium leading-tight">{vendor.status === "pending" ? "Approval pending" : vendor.status === "rejected" ? "Registration rejected" : "Account suspended"}</h1>
        <p className="mt-4 text-[14px] leading-7 text-graphite/75">{msg}</p>
        {vendor.statusNote ? <div className="mt-5"><Notice tone="info">Note from GYPSOS: {vendor.statusNote}</Notice></div> : null}
        <div className="mt-7 flex gap-3">
          <Btn variant="ghost" onClick={() => void reload()}>Check again</Btn>
          <Btn onClick={out}>Sign out</Btn>
        </div>
      </Screen>
    );
  }

  return (
    <VendorCtx.Provider value={{ vendor, reload }}>
      <PortalShell role={`Vendor · ${vendor.vendorCode}`} nav={NAV} loginHref="/login" userLabel={vendor.businessName}>
        {children}
      </PortalShell>
    </VendorCtx.Provider>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh place-items-center bg-sand px-5 text-graphite">
      <div className="w-full max-w-[520px] border border-graphite/15 bg-white p-8 sm:p-10">{children}</div>
    </div>
  );
}
