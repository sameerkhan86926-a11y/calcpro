"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FDPage() {
  const [dark, setDark] = useState(true);
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  const t = Number(years) || 0;

  // Standard Indian Banking FD formula (Quarterly compounding: n = 4)
  const maturity = p > 0 ? p * Math.pow(1 + r / 100 / 4, 4 * t) : 0;
  const interest = maturity > p ? maturity - p : 0;

  const money = (n: number) =>
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>
          <div>
            <h1>CalcPro</h1>
            <p>FD Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>INVESTMENT TOOL</span>
        <h2>FD Calculator</h2>
        <p>Calculate fixed deposit maturity and interest.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Deposit Amount</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
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
          <span>Deposit</span>
          <strong>₹{money(p)}</strong>
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
