"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfitLossPage() {
  const [dark, setDark] = useState(true);
  const [cost, setCost] = useState("1000");
  const [selling, setSelling] = useState("1200");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const cp = Number(cost) || 0;
  const sp = Number(selling) || 0;

  const difference = sp - cp;
  const percentage = cp > 0 ? Math.abs(difference / cp) * 100 : 0;

  const money = (n: number) =>
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const isProfit = difference >= 0;

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>Profit & Loss</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>BUSINESS TOOL</span>
        <h2>Profit & Loss</h2>
        <p>Calculate your business profit or loss percentage.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Cost Price</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              step="any"
            />
          </div>
        </label>

        <label>
          <span>Selling Price</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={selling}
              onChange={(e) => setSelling(e.target.value)}
              min="0"
              step="any"
            />
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>{isProfit ? "Total Profit" : "Total Loss"}</p>
        <strong style={{ color: isProfit ? "#22c55e" : "#ef4444" }}>
          ₹{money(Math.abs(difference))}
        </strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>{isProfit ? "Profit Margin" : "Loss Margin"}</span>
          <strong style={{ color: isProfit ? "#22c55e" : "#ef4444" }}>
            {percentage.toFixed(2)}%
          </strong>
        </div>

        <div className="result-row">
          <span>Cost Price</span>
          <strong>₹{money(cp)}</strong>
        </div>

        <div className="result-row">
          <span>Selling Price</span>
          <strong>₹{money(sp)}</strong>
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
