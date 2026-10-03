"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RDPage() {
  const [dark, setDark] = useState(true);
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const p = Number(monthly) || 0;
  const r = Number(rate) || 0;
  const yr = Number(years) || 0;
  const quarters = yr * 4;

  const quarterlyRate = r / 400;

  // Standard Indian Banking RD formula (Quarterly Compounding on monthly deposits)
  const maturity =
    p <= 0 || yr <= 0
      ? 0
      : quarterlyRate === 0
      ? p * yr * 12
      : p *
        ((Math.pow(1 + quarterlyRate, quarters) - 1) /
          (1 - Math.pow(1 + quarterlyRate, -1 / 3)));

  const invested = p * yr * 12;
  const interest = maturity > invested ? maturity - invested : 0;

  const money = (x: number) =>
    x.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>
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
              min="0"
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
              min="0"
              step="0.1"
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
              min="0"
              step="0.5"
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
