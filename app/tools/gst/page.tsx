"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GSTPage() {
  const [dark, setDark] = useState(true);
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<"add" | "remove">("add");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const value = Number(amount) || 0;
  const gstRate = Number(rate) || 0;

  const gst =
    mode === "add"
      ? (value * gstRate) / 100
      : value - value / (1 + gstRate / 100);

  const baseAmount =
    mode === "add"
      ? value
      : value - gst;

  const finalAmount =
    mode === "add"
      ? value + gst
      : value;

  const halfGst = gst / 2;

  const money = (n: number) =>
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>
          <div>
            <h1>CalcPro</h1>
            <p>GST Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>TAX TOOL</span>
        <h2>GST Calculator</h2>
        <p>Add GST or remove GST from any amount.</p>
      </section>

      <div className="mode-row">
        <button
          className={mode === "add" ? "mode active" : "mode"}
          onClick={() => setMode("add")}
        >
          Add GST
        </button>

        <button
          className={mode === "remove" ? "mode active" : "mode"}
          onClick={() => setMode("remove")}
        >
          Remove GST
        </button>
      </div>

      <section className="emi-form">
        <label>
          <span>Amount</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>
        </label>

        <label>
          <span>GST Rate</span>
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
      </section>

      <section className="emi-result">
        <p>Total GST</p>
        <strong>₹{money(gst)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Base / Net Amount</span>
          <strong>₹{money(baseAmount)}</strong>
        </div>

        <div className="result-row">
          <span>CGST ({(gstRate / 2).toFixed(1)}%)</span>
          <strong>₹{money(halfGst)}</strong>
        </div>

        <div className="result-row">
          <span>SGST ({(gstRate / 2).toFixed(1)}%)</span>
          <strong>₹{money(halfGst)}</strong>
        </div>

        <div className="result-row">
          <span>Total / Gross Amount</span>
          <strong>₹{money(finalAmount)}</strong>
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
