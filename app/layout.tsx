import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalcPro — Smart Professional Calculator",
  description:
    "CalcPro is a fast, accurate and professional all-in-one calculator for everyday, scientific, financial and business calculations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
