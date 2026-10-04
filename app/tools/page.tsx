"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const tools = [
  {
    name: "Cash Counter & Denomination",
    description: "Count currency notes & create WhatsApp cash slips",
    href: "/tools/cash-counter/",
  },
  {
    name: "EMI Calculator",
    description: "Calculate monthly loan EMI",
    href: "/tools/emi/",
  },
  {
    name: "GST Calculator",
    description: "Add or remove GST",
    href: "/tools/gst/",
  },
  {
    name: "SIP Calculator",
    description: "Estimate SIP returns",
    href: "/tools/sip/",
  },
  {
    name: "FD Calculator",
    description: "Calculate fixed deposit maturity",
    href: "/tools/fd/",
  },
  {
    name: "RD Calculator",
    description: "Calculate recurring deposit returns",
    href: "/tools/rd/",
  },
  {
    name: "Simple Interest",
    description: "Calculate simple interest",
    href: "/tools/simple-interest/",
  },
  {
    name: "Compound Interest",
    description: "Calculate compound interest",
    href: "/tools/compound-interest/",
  },
  {
    name: "Profit & Loss",
    description: "Calculate business profit or loss",
    href: "/tools/profit-loss/",
  },
  {
    name: "Discount Calculator",
    description: "Calculate discounted price",
    href: "/tools/discount/",
  },
  {
    name: "Percentage Calculator",
    description: "Calculate percentage instantly",
    href: "/tools/percentage/",
  },
  {
    name: "Reducing Loan",
    description: "Calculate reducing balance loan & flat comparison",
    href: "/tools/reducing-loan/",
  },
];

export default function ToolsPage() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) {
      setDark(savedTheme === "dark");
    }
  }, []);

  const themeColors = {
    bg: dark ? "#09090b" : "#f8fafc",
    cardBg: dark ? "#18181b" : "#ffffff",
    cardBorder: dark ? "#27272a" : "#e2e8f0",
    textPrimary: dark ? "#ffffff" : "#0f172a",
    textSecondary: dark ? "#a1a1aa" : "#64748b",
    accent: dark ? "#38bdf8" : "#0284c7",
  };

  return (
    <main
      className={`app ${dark ? "dark" : "light"} tools-page`}
      style={{
        backgroundColor: themeColors.bg,
        color: themeColors.textPrimary,
        minHeight: "100dvh",
        paddingBottom: "90px",
      }}
    >
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>
          <div>
            <h1 style={{ color: themeColors.textPrimary }}>CalcPro</h1>
            <p style={{ color: themeColors.textSecondary }}>Smart Calculator</p>
          </div>
        </div>

        <Link
          href="/"
          className="back-button"
          style={{
            color: themeColors.textPrimary,
            border: `1px solid ${themeColors.cardBorder}`,
            background: themeColors.cardBg,
          }}
        >
          Back
        </Link>
      </header>

      <section className="tools-heading" style={{ padding: "0 16px", marginTop: "12px" }}>
        <span style={{ color: themeColors.accent, fontSize: "11px", fontWeight: "700", letterSpacing: "1px" }}>
          TOOLS
        </span>
        <h2 style={{ color: themeColors.textPrimary, fontSize: "24px", margin: "4px 0" }}>
          All Calculators
        </h2>
        <p style={{ color: themeColors.textSecondary, fontSize: "13px", margin: 0 }}>
          Powerful calculators for finance, business and everyday use.
        </p>
      </section>

      <section
        className="tools-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px",
        }}
      >
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="tool-card"
            style={{
              backgroundColor: themeColors.cardBg,
              border: `1px solid ${themeColors.cardBorder}`,
              borderRadius: "14px",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textDecoration: "none",
              boxShadow: dark ? "none" : "0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <h3 style={{ color: themeColors.textPrimary, fontSize: "15px", margin: "0 0 3px 0", fontWeight: "600" }}>
                {tool.name}
              </h3>
              <p style={{ color: themeColors.textSecondary, fontSize: "12px", margin: 0 }}>
                {tool.description}
              </p>
            </div>

            <span style={{ color: themeColors.accent, fontSize: "18px", fontWeight: "bold" }}>
              →
            </span>
          </Link>
        ))}
      </section>

      <nav
        className="bottom-nav"
        style={{
          backgroundColor: themeColors.cardBg,
          borderTop: `1px solid ${themeColors.cardBorder}`,
        }}
      >
        <Link href="/" className="nav-item">
          <span>⌕</span>
          <small>Calculator</small>
        </Link>

        <Link href="/tools/" className="nav-item active">
          <span>+</span>
          <small>Tools</small>
        </Link>

        <Link href="/#history" className="nav-item">
          <span>≡</span>
          <small>History</small>
        </Link>

        <Link href="/settings/" className="nav-item">
          <span>⚙</span>
          <small>Settings</small>
        </Link>
      </nav>
    </main>
  );
}
