"use client";

import { Loader2 } from "lucide-react";
import { Children, cloneElement, isValidElement, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const inputCls =
  "mt-2 w-full border border-graphite/30 bg-white px-3.5 py-3 text-[16px] text-graphite sm:text-[14px] outline-none transition-colors placeholder:text-graphite/35 focus:border-ochre-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-ochre/60 aria-[invalid=true]:border-red-600 disabled:bg-graphite/5";
export const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.22em] text-graphite";

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <p className="flex items-center gap-2 py-10 text-[13px] text-graphite/60" role="status">
      <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {label}…
    </p>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  const cls = tone === "error" ? "border-red-600 bg-red-50 text-red-700" : tone === "success" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-ochre-deep bg-ochre/10 text-graphite";
  return (
    <p className={`border-l-4 px-4 py-3 text-[13px] font-medium leading-6 ${cls}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "ochre"; busy?: boolean };
export function Btn({ variant = "primary", busy, className = "", children, disabled, ...rest }: BtnProps) {
  const v = {
    primary: "bg-graphite text-cream hover:bg-ochre-deep",
    ochre: "bg-ochre text-graphite hover:bg-graphite hover:text-cream",
    ghost: "border border-graphite/40 text-graphite hover:bg-graphite hover:text-cream",
    danger: "border border-red-600 text-red-700 hover:bg-red-600 hover:text-white",
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
    >
      {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-graphite/15 bg-white p-5 sm:p-6 ${className}`}>
      {title || action ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="font-serif text-[22px] font-medium text-graphite">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-ochre-deep">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-[clamp(30px,4vw,44px)] font-medium leading-tight text-graphite">{title}</h1>
      {children ? <p className="mt-2 max-w-2xl text-[14px] leading-6 text-graphite/70">{children}</p> : null}
    </header>
  );
}

const BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-sky-100 text-sky-800",
  sent: "bg-emerald-100 text-emerald-800",
  verified: "bg-emerald-100 text-emerald-800",
  submitted: "bg-sky-100 text-sky-800",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  not_submitted: "bg-graphite/10 text-graphite/70",
  in: "bg-emerald-100 text-emerald-800",
  out: "bg-red-100 text-red-700",
};
export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${BADGE[value] ?? "bg-graphite/10"}`}>{label ?? value.replace("_", " ")}</span>;
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {children}
      </label>
      {hint && !error ? <p className="mt-1.5 text-[12px] text-graphite/55">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-[12.5px] font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ error, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...rest} aria-invalid={error ? true : undefined} className={`${inputCls} ${className}`} />;
}
export function TextArea({ error, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...rest} aria-invalid={error ? true : undefined} className={`${inputCls} min-h-[88px]`} />;
}
export function Select({ error, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select {...rest} aria-invalid={error ? true : undefined} className={inputCls}>
      {children}
    </select>
  );
}

/**
 * Table that turns into stacked cards on phones: each cell shows its column heading (from `head`)
 * beside the value, so nothing needs horizontal scrolling.
 */
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  const rows = Children.map(children, (row) => {
    if (!isValidElement<{ children?: ReactNode }>(row) || typeof row.type !== "string") return row;
    return cloneElement(
      row,
      undefined,
      Children.map(row.props.children, (cell, i) => (isValidElement(cell) ? cloneElement(cell as ReactElement<Record<string, unknown>>, { "data-label": head[i] ?? "" }) : cell)),
    );
  });
  return (
    <div className="sm:overflow-x-auto">
      <table className="block w-full border-collapse text-left text-[13px] sm:table sm:min-w-[560px]">
        <thead className="max-sm:sr-only sm:table-header-group">
          <tr className="border-b border-graphite/20 text-[10px] uppercase tracking-[0.2em] text-graphite/55">
            {head.map((h, i) => (
              <th key={`${h}-${i}`} className="px-3 py-3 font-semibold first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={[
            "max-sm:block sm:table-row-group",
            "[&>tr]:border-b [&>tr]:border-graphite/10 [&>tr>td]:px-3 [&>tr>td]:py-3.5 [&>tr>td]:align-top sm:[&>tr>td:first-child]:pl-0",
            "max-sm:[&>tr]:block max-sm:[&>tr]:py-3 max-sm:[&>tr>td]:flex max-sm:[&>tr>td]:items-baseline max-sm:[&>tr>td]:justify-between max-sm:[&>tr>td]:gap-4 max-sm:[&>tr>td]:px-0 max-sm:[&>tr>td]:py-1.5 max-sm:[&>tr>td]:text-right",
            "max-sm:[&>tr>td]:before:shrink-0 max-sm:[&>tr>td]:before:text-left max-sm:[&>tr>td]:before:text-[10px] max-sm:[&>tr>td]:before:font-semibold max-sm:[&>tr>td]:before:uppercase max-sm:[&>tr>td]:before:tracking-[0.18em] max-sm:[&>tr>td]:before:text-graphite/55 max-sm:[&>tr>td]:before:content-[attr(data-label)]",
            "max-sm:[&>tr>td[data-label='']]:justify-start max-sm:[&>tr>td[data-label='']]:text-left",
          ].join(" ")}
        >
          {rows}
        </tbody>
      </table>
      {empty ? <p className="py-8 text-center text-[13px] text-graphite/55">{empty}</p> : null}
    </div>
  );
}
