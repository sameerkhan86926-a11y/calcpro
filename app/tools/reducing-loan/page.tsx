"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ReducingLoanPage() {
  const [dark, setDark] = useState(true);
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("10.5");
  const [tenureYears, setTenureYears] = useState("5");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const principal = Number(loanAmount) || 0;
  const annualRate = Number(interestRate) || 0;
  const years = Number(tenureYears) || 0;

  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;

  // Reducing Balance EMI Formula
  let emi = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (principal > 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      emi = principal / totalMonths;
    } else {
      emi =
        (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    totalPayment = emi * totalMonths;
    totalInterest = totalPayment - principal;
  }

  // Equivalent Flat Rate Comparison
  const equivalentFlatRate =
    years > 0 && principal > 0
      ? (totalInterest / (principal * years)) * 100
      : 0;

  const money = (val: number) =>
    val.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">📉</div>
          <div>
            <h1>CalcPro</h1>
            <p>Reducing Loan</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>LOAN ANALYTICS</span>
        <h2>Reducing Balance Loan</h2>
        <p>
          Interest is calculated only on the outstanding principal balance each month.
        </p>
      </section>

      <section className="emi-form">
        <label>
          <span>Loan Principal Amount</span>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              min="0"
            />
          </div>
        </label>

        <label>
          <span>Annual Reducing Interest Rate</span>
          <div className="input-box">
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              step="0.05"
            />
            <span>%</span>
          </div>
        </label>

        <label>
          <span>Loan Period</span>
          <div className="input-box">
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              min="1"
              step="1"
            />
            <span>Years</span>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Monthly Installment (EMI)</p>
        <strong>₹{money(emi)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Principal Amount</span>
          <strong>₹{money(principal)}</strong>
        </div>

        <div className="result-row">
          <span>Total Interest Paid</span>
          <strong>₹{money(Math.max(totalInterest, 0))}</strong>
        </div>

        <div className="result-row">
          <span>Total Repayment</span>
          <strong>₹{money(totalPayment)}</strong>
        </div>

        <div className="result-row" style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "8px" }}>
          <span>Equivalent Flat Rate</span>
          <strong style={{ color: "#22c55e" }}>
            {equivalentFlatRate.toFixed(2)}% p.a.
          </strong>
        </div>
      </section>

      <section className="emi-info">
        <h3>Reducing vs Flat Rate Insight</h3>
        <p>
          A <strong>{annualRate}%</strong> reducing interest rate actually equals approximately <strong>{equivalentFlatRate.toFixed(2)}%</strong> flat interest because the principal decreases every month.
        </p>
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
