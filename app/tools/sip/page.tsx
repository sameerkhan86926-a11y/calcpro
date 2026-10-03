"use client";

import { useState } from "react";
import Link from "next/link";

export default function SIPPage() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");

  const p = Number(monthly) || 0;
  const annualRate = Number(rate) || 0;
  const months = (Number(years) || 0) * 12;
  const monthlyRate = annualRate / 12 / 100;

  const futureValue =
    monthlyRate === 0
      ? p * months
      : p *
        (((Math.pow(1 + monthlyRate, months) - 1) /
          monthlyRate) *
          (1 + monthlyRate));

  const invested = p * months;
  const returns = futureValue - invested;

  const money = (n: number) =>
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className="app dark emi-page">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>SIP Calculator</p>
          </div>
        </div>
        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>INVESTMENT TOOL</span>
        <h2>SIP Calculator</h2>
        <p>Estimate the future value of your monthly SIP.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Monthly Investment</span>
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
          <span>Expected Return (Annual)</span>
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
          <span>Investment Period</span>
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
        <p>Estimated Future Value</p>
        <strong>₹{money(futureValue)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Invested Amount</span>
          <strong>₹{money(invested)}</strong>
        </div>

        <div className="result-row">
          <span>Estimated Returns</span>
          <strong>₹{money(returns)}</strong>
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
