"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DiscountPage() {
  const [dark, setDark] = useState(true);
  const [price, setPrice] = useState("2000");
  const [discount, setDiscount] = useState("20");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const original = Number(price) || 0;
  const rate = Number(discount) || 0;

  const saved = (original * rate) / 100;
  const finalPrice = original - saved;

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
            <p>Discount Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>SHOPPING TOOL</span>
        <h2>Discount Calculator</h2>
        <p>Calculate your discount and final selling price.</p>
      </section>

      <section className="emi-form">
        <label>
          <span>Original Price</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
            />
          </div>
        </label>

        <label>
          <span>Discount</span>
          <div className="input-box">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
            <span>%</span>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Final Price</p>
        <strong>₹{money(finalPrice)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Original Price</span>
          <strong>₹{money(original)}</strong>
        </div>

        <div className="result-row">
          <span>You Save</span>
          <strong>₹{money(saved)}</strong>
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
