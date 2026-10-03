"use client";

import { useState } from "react";
import Link from "next/link";

export default function RDPage() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");

  const p = Number(monthly) || 0;
  const r = Number(rate) || 0;
  const n = (Number(years) || 0) * 4;

  const quarterlyRate = r / 400;

  const maturity =
    quarterlyRate === 0
      ? p * n
      : p *
        ((Math.pow(1 + quarterlyRate, n) - 1) /
          (1 - Math.pow(1 + quarterlyRate, -1 / 3)));

  const invested = p * (Number(years) || 0) * 12;
  const interest = maturity - invested;

  const money = (x: number) =>
    x.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className="app dark emi-page">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>RD Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>INVESTMENT TOOL</span>
        <h2>RD Calculator</h2>
        <p>Estimate recurring deposit maturity.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Monthly Deposit</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Interest Rate</span>
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
          <span>Tenure</span>
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
        <p>Maturity Amount</p>
        <strong>₹{money(maturity)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Total Deposited</span>
          <strong>₹{money(invested)}</strong>
        </div>

        <div className="result-row">
          <span>Interest Earned</span>
          <strong>₹{money(interest)}</strong>
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
