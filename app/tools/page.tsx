"use client";

import { useState } from "react";
import Link from "next/link";

const tools = [
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
];

export default function ToolsPage() {
  const [dark, setDark] = useState(true);

  return (
    <main className={`app ${dark ? "dark" : "light"} tools-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>

          <div>
            <h1>CalcPro</h1>
            <p>Smart Calculator</p>
          </div>
        </div>

        <Link href="/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tools-heading">
        <span>TOOLS</span>

        <h2>All Calculators</h2>

        <p>
          Powerful calculators for finance, business and everyday use.
        </p>
      </section>

      <section className="tools-list">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="tool-card"
          >
            <div>
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>

            <span className="tool-arrow">→</span>
          </Link>
        ))}
      </section>

      <nav className="bottom-nav">
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

        <button
          className="nav-item"
          onClick={() => setDark((value) => !value)}
        >
          <span>{dark ? "☼" : "☾"}</span>
          <small>{dark ? "Light" : "Dark"}</small>
        </button>
      </nav>
    </main>
  );
}
