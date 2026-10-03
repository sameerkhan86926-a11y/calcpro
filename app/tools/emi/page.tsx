"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EmiPage() {
  const [dark, setDark] = useState(true);
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("10");
  const [tenure, setTenure] = useState("5");

  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");
  }, []);

  const principal = Number(loanAmount) || 0;
  const annualRate = Number(interestRate) || 0;
  const years = Number(tenure) || 0;

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  let emi = 0;

  if (principal > 0 && months > 0) {
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi =
        (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  const money = (value: number) =>
    value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  return (
    <main className={`app ${dark ? "dark" : "light"} emi-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>

          <div>
            <h1>CalcPro</h1>
            <p>EMI Calculator</p>
          </div>
        </div>

        <Link href="/tools/" className="back-button">
          Back
        </Link>
      </header>

      <section className="tool-heading">
        <span>FINANCE TOOL</span>
        <h2>EMI Calculator</h2>
        <p>
          Calculate your monthly loan payment, total interest
          and total repayment.
        </p>
      </section>

      <section className="emi-form">
        <label>
          <span>Loan Amount</span>

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
          <span>Interest Rate (Annual)</span>

          <div className="input-box">
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              step="0.01"
            />

            <span>%</span>
          </div>
        </label>

        <label>
          <span>Loan Tenure</span>

          <div className="input-box">
            <input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              min="1"
              step="1"
            />

            <span>Years</span>
          </div>
        </label>
      </section>

      <section className="emi-result">
        <p>Monthly EMI</p>

        <strong>₹{money(emi)}</strong>

        <div className="result-divider" />

        <div className="result-row">
          <span>Principal Amount</span>
          <strong>₹{money(principal)}</strong>
        </div>

        <div className="result-row">
          <span>Total Interest</span>
          <strong>₹{money(Math.max(totalInterest, 0))}</strong>
        </div>

        <div className="result-row">
          <span>Total Payment</span>
          <strong>₹{money(totalPayment)}</strong>
        </div>
      </section>

      <section className="emi-info">
        <h3>How EMI is calculated</h3>

        <p>
          EMI is calculated using the loan principal, monthly
          interest rate and total number of monthly payments.
        </p>

        <div className="formula">
          EMI = P × R × (1 + R)ⁿ ÷ ((1 + R)ⁿ − 1)
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
