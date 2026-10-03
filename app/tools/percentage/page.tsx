"use client";

import { useState } from "react";
import Link from "next/link";

export default function PercentagePage() {
  const [percentage, setPercentage] = useState("20");
  const [number, setNumber] = useState("5000");

  const p = Number(percentage) || 0;
  const n = Number(number) || 0;

  const result = (p / 100) * n;

  const money = (x: number) =>
    x.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  return (
    <main className="app dark emi-page">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>Percentage Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>EVERYDAY TOOL</span>
        <h2>Percentage</h2>
        <p>Calculate any percentage of a number instantly.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Percentage</span>
          <div className="input-box">
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            <span>%</span>
          </div>
        </label>

        <label>
          <span>Number</span>
          <div className="input-box">
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Result</p>
        <strong>{money(result)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Calculation</span>
          <strong>
            {p}% of {money(n)}
          </strong>
        </div>
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
        <Link href="/" className="nav-item">
          <span>≡</span>
          <small>History</small>
        </Link>
        <Link href="/" className="nav-item">
          <span>⚙</span>
          <small>Settings</small>
        </Link>
      </nav>
    </main>
  );
}
