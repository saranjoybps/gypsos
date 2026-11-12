import type { Metadata } from "next";
import { LoginForm } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Admin sign in | GYPSOS", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <LoginForm variant="admin" />;
}
