"use client";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/gypsos/logo";
import { Btn, Field, Notice, TextArea, TextInput } from "@/components/portal/ui";
import { ApiFail, api, authFor, friendlyAuthError, useFirebaseUser } from "@/lib/portal/client";

function AuthFrame({ eyebrow, title, intro, children, footer }: { eyebrow: string; title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-svh bg-sand text-graphite lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="plaster-grain relative hidden flex-col justify-between bg-graphite p-12 text-cream lg:flex">
        <Link href="/" aria-label="GYPSOS website">
          <Logo className="w-[150px]" />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-ochre">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-[clamp(36px,3.6vw,54px)] font-medium leading-[1.05]">{title}</h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-cream/70">{intro}</p>
        </div>
        <p className="text-[11px] tracking-[0.2em] text-cream/40">GYPSOS BUILDTECH INDIA PRIVATE LIMITED</p>
      </div>
      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[640px]">
          <Link href="/" aria-label="GYPSOS website" className="mb-8 inline-block lg:hidden">
            <Logo className="w-[120px]" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.4em] text-ochre-deep lg:hidden">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight lg:hidden">{title}</h1>
          <div className="mt-6 border border-graphite/15 bg-white p-6 sm:p-9 lg:mt-0">{children}</div>
          <div className="mt-6 text-[13px] text-graphite/70">{footer}</div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login (vendor + admin)                                              */
/* ------------------------------------------------------------------ */

export function LoginForm({ variant }: { variant: "vendor" | "admin" }) {
  const router = useRouter();
  const { user, ready } = useFirebaseUser(variant);
  const auth = authFor(variant);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = variant === "admin";
  const home = isAdmin ? "/admin" : "/platform-vendor";

  useEffect(() => {
    if (ready && user && !busy) router.replace(home);
  }, [ready, user, busy, router, home]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (isAdmin) {
        // Only the configured admin UID may enter; anyone else is signed straight back out.
        try {
          await api("/api/admin/me");
        } catch (err) {
          await signOut(auth);
          throw err instanceof ApiFail && err.status === 403 ? new Error("This account is not authorised for the admin portal.") : err;
        }
      }
      router.replace(home);
    } catch (err) {
      setError(err instanceof Error && !("code" in err) ? err.message : friendlyAuthError((err as { code?: string }).code));
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      eyebrow={isAdmin ? "Admin portal" : "Vendor portal"}
      title={isAdmin ? "Admin sign in" : "Sign in to your vendor account"}
      intro={isAdmin ? "Review vendors, approve stock requests, send invoices and manage inventory." : "Request stock, view invoices and manage your inventory with GYPSOS."}
      footer={
        isAdmin ? (
          <Link href="/" className="link-underline">
            Back to website
          </Link>
        ) : (
          <>
            New vendor?{" "}
            <Link href="/register" className="font-semibold text-graphite underline underline-offset-4">
              Register here
            </Link>
          </>
        )
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate aria-label={isAdmin ? "Admin sign in" : "Vendor sign in"}>
        <h2 className="font-serif text-[26px] font-medium">{isAdmin ? "Admin sign in" : "Vendor sign in"}</h2>
        <Field label="Email">
          <TextInput type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error ? <Notice>{error}</Notice> : null}
        <Btn type="submit" busy={busy} disabled={!email || !password} className="w-full">
          Sign in
        </Btn>
      </form>
    </AuthFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Register                                                             */
/* ------------------------------------------------------------------ */

const EMPTY = { fullName: "", phone: "", email: "", password: "", confirm: "", businessName: "", address: "", location: "", district: "", state: "", pincode: "", deliveryAddress: "", website: "" };
type Form = typeof EMPTY;

export function RegisterForm() {
  const [v, setV] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (v.password !== v.confirm) {
      setErrors({ confirm: "Passwords do not match." });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { confirm: _confirm, ...body } = v;
      void _confirm;
      const res = await api<{ vendorCode: string }>("/api/register", { body });
      setCode(res.vendorCode || "pending");
    } catch (err) {
      if (err instanceof ApiFail) {
        setErrors((err.fields ?? {}) as Partial<Record<keyof Form, string>>);
        setError(err.message);
      } else setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    return (
      <AuthFrame eyebrow="Vendor registration" title="Become a GYPSOS vendor" intro="Register your business. Once GYPSOS approves it, you can sign in to the vendor portal." footer={null}>
        <div role="status">
          <CheckCircle2 size={34} strokeWidth={1.3} className="text-ochre-deep" aria-hidden="true" />
          <h2 className="mt-5 font-serif text-[30px] font-medium leading-tight">Registration received</h2>
          <p className="mt-3 text-[14px] leading-7 text-graphite/75">
            Your vendor code is <strong className="font-semibold text-graphite">{code}</strong>. Our team will review your details. You can sign in once your registration is approved, then complete your KYC.
          </p>
          <Link href="/login" className="mt-7 inline-block bg-graphite px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream hover:bg-ochre-deep">
            Go to sign in
          </Link>
        </div>
      </AuthFrame>
    );
  }

  const text = (k: keyof Form, label: string, props: { type?: string; autoComplete?: string; placeholder?: string; hint?: string } = {}) => (
    <Field label={label} error={errors[k]} hint={props.hint}>
      <TextInput name={k} type={props.type} autoComplete={props.autoComplete} placeholder={props.placeholder} value={v[k]} onChange={set(k)} error={errors[k]} />
    </Field>
  );

  return (
    <AuthFrame
      eyebrow="Vendor registration"
      title="Become a GYPSOS vendor"
      intro="Register your business. Once GYPSOS approves it, you can sign in to the vendor portal, request stock and receive invoices."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-graphite underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-9" noValidate aria-label="Vendor registration">
        <fieldset className="space-y-5">
          <legend className="font-serif text-[24px] font-medium">Personal details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("fullName", "Full name", { autoComplete: "name" })}
            {text("phone", "Mobile number", { type: "tel", autoComplete: "tel", placeholder: "10-digit mobile" })}
          </div>
          {text("email", "Email (your login)", { type: "email", autoComplete: "email" })}
          <div className="grid gap-5 sm:grid-cols-2">
            {text("password", "Password", { type: "password", autoComplete: "new-password", hint: "At least 8 characters." })}
            {text("confirm", "Confirm password", { type: "password", autoComplete: "new-password" })}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-serif text-[24px] font-medium">Vendor details</legend>
          {text("businessName", "Business / shop name")}
          <Field label="Business address" error={errors.address}>
            <TextArea name="address" value={v.address} onChange={set("address")} error={errors.address} autoComplete="street-address" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("location", "Location (city / town)")}
            {text("district", "District")}
            {text("state", "State")}
            {text("pincode", "Pincode", { placeholder: "6 digits" })}
          </div>
          <Field label="Delivery address (if different)" error={errors.deliveryAddress} hint="Leave blank to deliver to the business address.">
            <TextArea name="deliveryAddress" value={v.deliveryAddress} onChange={set("deliveryAddress")} />
          </Field>
        </fieldset>

        {/* honeypot */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
          </label>
        </div>

        {error ? <Notice>{error}</Notice> : null}
        <Btn type="submit" busy={busy} className="w-full">
          Submit registration
        </Btn>
      </form>
    </AuthFrame>
  );
}
