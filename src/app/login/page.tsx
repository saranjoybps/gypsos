import type { Metadata } from "next";
import { LoginForm } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Vendor sign in | GYPSOS", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <LoginForm variant="vendor" />;
}
