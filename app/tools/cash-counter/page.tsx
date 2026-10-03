"use client";

import { useState } from "react";
import Link from "next/link";
import { numberToIndianWords } from "@/lib/numToWords";

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function CashCounter() {
  const [counts, setCounts] = useState<{ [key: number]: number }>({
    500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0,
  });

  const handleCountChange = (denom: number, value: string) => {
    const val = parseInt(value, 10);
    setCounts((prev) => ({
      ...prev,
      [denom]: isNaN(val) || val < 0 ? 0 : val,
    }));
  };

  const totalNotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalAmount = DENOMINATIONS.reduce((sum, d) => sum + d * (counts[d] || 0), 0);

  const resetAll = () => {
    setCounts({
      500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0,
    });
  };

  const shareSlip = () => {
    const activeDenoms = DENOMINATIONS.filter((d) => (counts[d] || 0) > 0);
    let msg = `*--- CASH DENOMINATION SLIP ---*\n`;
    activeDenoms.forEach((d) => {
      msg += `₹${d} x ${counts[d]} = ₹${(d * counts[d]).toLocaleString("en-IN")}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*Total Notes:* ${totalNotes}\n`;
    msg += `*Grand Total:* ₹${totalAmount.toLocaleString("en-IN")}\n`;
    msg += `*In Words:* ${numberToIndianWords(totalAmount)}\n`;
    msg += `_Generated via CalcPro_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, "_system");
  };

  return (
    <main className="app dark" style={{ minHeight: "100dvh", paddingBottom: "110px" }}>
      <header className="app-header" style={{ marginBottom: "16px" }}>
        <Link href="/tools/" className="back-button">
          ◀ Back
        </Link>
        <h2 style={{ fontSize: "17px", fontWeight: "bold" }}>Cash Counter</h2>
        <button
          onClick={resetAll}
          style={{
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Reset
        </button>
      </header>

      {/* Summary Card */}
      <div
        style={{
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "18px",
          padding: "16px",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <small style={{ color: "#a1a1aa", fontSize: "11px" }}>Total Amount</small>
        <h2 style={{ fontSize: "32px", color: "#38bdf8", margin: "4px 0" }}>
          ₹{totalAmount.toLocaleString("en-IN")}
        </h2>
        <p style={{ fontSize: "11px", color: "#cbd5e1", margin: "2px 0 8px" }}>
          {numberToIndianWords(totalAmount)}
        </p>
        <span style={{ fontSize: "12px", color: "#71717a" }}>
          Total Notes: <strong>{totalNotes}</strong>
        </span>

        {totalAmount > 0 && (
          <button
            onClick={shareSlip}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              borderRadius: "10px",
              background: "#22c55e",
              color: "#fff",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            Share WhatsApp Slip
          </button>
        )}
      </div>

      {/* Denominations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {DENOMINATIONS.map((d) => (
          <div
            key={d}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#18181b",
              border: "1px solid #27272a",
              padding: "8px 14px",
              borderRadius: "14px",
            }}
          >
            <div style={{ width: "60px", fontWeight: "bold", fontSize: "15px" }}>₹{d}</div>
            <span style={{ color: "#71717a" }}>×</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={counts[d] === 0 ? "" : counts[d]}
              onChange={(e) => handleCountChange(d, e.target.value)}
              style={{
                width: "90px",
                height: "38px",
                background: "#27272a",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                textAlign: "center",
                fontSize: "15px",
                fontWeight: "bold",
                outline: "none",
              }}
            />
            <span style={{ color: "#71717a" }}>=</span>
            <div style={{ width: "95px", textAlign: "right", fontWeight: "600", fontSize: "14px" }}>
              ₹{(d * (counts[d] || 0)).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
