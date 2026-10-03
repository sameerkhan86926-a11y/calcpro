"use client";

import { useState } from "react";
import Link from "next/link";

export default function GSTPage() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<"add" | "remove">("add");

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
            />
            <span>%</span>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>GST Amount</p>
        <strong>₹{money(gst)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Base Amount</span>
          <strong>₹{money(baseAmount)}</strong>
        </div>

        <div className="result-row">
          <span>GST</span>
          <strong>₹{money(gst)}</strong>
        </div>

        <div className="result-row">
          <span>Final Amount</span>
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
