"use client";

import { useState } from "react";
import Link from "next/link";

export default function SimpleInterestPage() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("5");

  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  const t = Number(years) || 0;

  const interest = (p * r * t) / 100;
  const total = p + interest;

  const money = (n: number) =>
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  return (
    <main className="app dark emi-page">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>Simple Interest</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>INTEREST TOOL</span>
        <h2>Simple Interest</h2>
        <p>Calculate interest on your principal amount.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Principal</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Rate</span>
          <div className="input-box">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span>%</span>
          </div>
        </label>

        <label>
          <span>Time</span>
          <div className="input-box">
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <span>Years</span>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Simple Interest</p>
        <strong>₹{money(interest)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Principal</span>
          <strong>₹{money(p)}</strong>
        </div>

        <div className="result-row">
          <span>Total Amount</span>
          <strong>₹{money(total)}</strong>
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
