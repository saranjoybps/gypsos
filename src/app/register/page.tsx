import type { Metadata } from "next";
import { RegisterForm } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Vendor registration | GYPSOS", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <RegisterForm />;
}
