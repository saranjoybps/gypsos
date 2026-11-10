import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GYPSOS | Premium Grade Gypsum Plaster by GYPSOS Buildtech India",
  description:
    "GYPSOS Buildtech India Private Limited: premium-grade gypsum plaster for smooth, affordable interior wall and ceiling finishing across India. Established 2020.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
