"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CompoundInterestPage() {
  const [dark, setDark] = useState(true);
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("5");
  const [frequency, setFrequency] = useState("4");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  const t = Number(years) || 0;
  const n = Number(frequency) || 1;

  const amount = p > 0 ? p * Math.pow(1 + r / 100 / n, n * t) : 0;
  const interest = amount > p ? amount - p : 0;

  const money = (x: number) =>
    x.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>Compound Interest</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>INTEREST TOOL</span>
        <h2>Compound Interest</h2>
        <p>Calculate compound growth over time.</p>
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
              min="0"
            />
          </div>
        </label>

        <label>
          <span>Annual Rate</span>
          <div className="input-box">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min="0"
              step="0.01"
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
              min="0"
              step="1"
            />
            <span>Years</span>
          </div>
        </label>

        <label>
          <span>Compounding</span>
          <div className="input-box">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                color: "inherit",
                border: 0,
                outline: 0,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              <option value="1" style={{ background: dark ? "#18181b" : "#fff", color: dark ? "#fff" : "#18181b" }}>Yearly</option>
              <option value="2" style={{ background: dark ? "#18181b" : "#fff", color: dark ? "#fff" : "#18181b" }}>Half-Yearly</option>
              <option value="4" style={{ background: dark ? "#18181b" : "#fff", color: dark ? "#fff" : "#18181b" }}>Quarterly</option>
              <option value="12" style={{ background: dark ? "#18181b" : "#fff", color: dark ? "#fff" : "#18181b" }}>Monthly</option>
            </select>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Total Amount</p>
        <strong>₹{money(amount)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Principal</span>
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
