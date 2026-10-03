"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  expression: string;
  result: string;
};

const initialKeys = [
  ["AC", "DEL", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", "="],
];

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "Error";

  return Number(value.toFixed(12)).toLocaleString("en-IN", {
    maximumFractionDigits: 12,
  });
}

function calculateExpression(expression: string) {
  try {
    let exp = expression
      .replace(/,/g, "")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/%/g, "/100");

    if (!/^[0-9+\-*/().\s]+$/.test(exp)) {
      return null;
    }

    if (!exp.trim()) {
      return 0;
    }

    const result = Function(`"use strict"; return (${exp})`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

export default function Home() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mode, setMode] = useState<"basic" | "scientific">("basic");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("calcpro-history");

      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore invalid local storage data.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calcpro-history", JSON.stringify(history));
  }, [history]);

  function clearAll() {
    setExpression("");
    setDisplay("0");
  }

  function deleteLast() {
    if (expression.length === 0) return;

    const next = expression.slice(0, -1);

    setExpression(next);
    setDisplay(next || "0");
  }

  function addValue(value: string) {
    if (display === "Error") {
      setExpression("");
      setDisplay("0");
    }

    const nextExpression = expression + value;

    setExpression(nextExpression);

    const result = calculateExpression(nextExpression);

    if (result !== null) {
      setDisplay(formatNumber(result));
    } else {
      setDisplay(nextExpression);
    }
  }

  function calculate() {
    if (!expression.trim()) return;

    const result = calculateExpression(expression);

    if (result === null) {
      setDisplay("Error");
      return;
    }

    const formatted = formatNumber(result);

    setHistory((previous) => [
      {
        expression,
        result: formatted,
      },
      ...previous,
    ].slice(0, 20));

    setDisplay(formatted);
    setExpression(String(result));
  }

  function handleKey(value: string) {
    if (value === "AC") {
      clearAll();
      return;
    }

    if (value === "DEL") {
      deleteLast();
      return;
    }

    if (value === "=") {
      calculate();
      return;
    }

    addValue(value);
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const key = event.key;

      if (
        (key >= "0" && key <= "9") ||
        key === "." ||
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/" ||
        key === "%"
      ) {
        event.preventDefault();

        const mapped =
          key === "*" ? "×" : key === "/" ? "÷" : key === "-" ? "−" : key;

        addValue(mapped);
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
      }

      if (key === "Escape") {
        clearAll();
      }

      if (key === "Backspace") {
        deleteLast();
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  });

  function scientific(value: string) {
    if (value === "√") {
      const number = Number(display.replace(/,/g, ""));
      if (!Number.isFinite(number) || number < 0) return;

      const result = Math.sqrt(number);
      setExpression(String(result));
      setDisplay(formatNumber(result));
      return;
    }

    if (value === "x²") {
      const number = Number(display.replace(/,/g, ""));
      if (!Number.isFinite(number)) return;

      const result = number ** 2;
      setExpression(String(result));
      setDisplay(formatNumber(result));
      return;
    }

    if (value === "x³") {
      const number = Number(display.replace(/,/g, ""));
      if (!Number.isFinite(number)) return;

      const result = number ** 3;
      setExpression(String(result));
      setDisplay(formatNumber(result));
      return;
    }

    if (value === "π") {
      addValue(String(Math.PI));
      return;
    }

    if (value === "sin") {
      const number = Number(display.replace(/,/g, ""));
      const result = Math.sin((number * Math.PI) / 180);
      setExpression(String(result));
      setDisplay(formatNumber(result));
      return;
    }

    if (value === "cos") {
      const number = Number(display.replace(/,/g, ""));
      const result = Math.cos((number * Math.PI) / 180);
      setExpression(String(result));
      setDisplay(formatNumber(result));
      return;
    }

    if (value === "tan") {
      const number = Number(display.replace(/,/g, ""));
      const result = Math.tan((number * Math.PI) / 180);
      setExpression(String(result));
      setDisplay(formatNumber(result));
    }
  }

  return (
    <div className="calc-app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">C</div>

            <div>
              <div className="brand-name">CalcPro</div>
              <div className="brand-subtitle">
                Smart Professional Calculator
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="header-button"
              onClick={clearAll}
              aria-label="Clear calculator"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <span className="hero-eyebrow">Fast • Accurate • Professional</span>

          <h1>Everything you need to calculate.</h1>

          <p>
            A clean, powerful calculator built for everyday calculations,
            scientific operations and future finance tools.
          </p>
        </section>

        <section className="calculator-layout">
          <div className="calculator-card">
            <div className="display">
              <div className="display-expression">
                {expression || "Ready to calculate"}
              </div>

              <div className="display-result">{display}</div>
            </div>

            <div className="calculator-toolbar">
              <div className="mode-group">
                <button
                  className={`mode-button ${
                    mode === "basic" ? "active" : ""
                  }`}
                  onClick={() => setMode("basic")}
                >
                  Basic
                </button>

                <button
                  className={`mode-button ${
                    mode === "scientific" ? "active" : ""
                  }`}
                  onClick={() => setMode("scientific")}
                >
                  Scientific
                </button>
              </div>

              <button className="small-action" onClick={deleteLast}>
                Delete
              </button>
            </div>

            {mode === "scientific" && (
              <div className="keypad">
                {["sin", "cos", "tan", "√", "x²", "x³", "π"].map(
                  (item) => (
                    <button
                      key={item}
                      className="key utility"
                      onClick={() => scientific(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            )}

            <div className="keypad">
              {initialKeys.flat().map((key, index) => {
                const isEquals = key === "=" && index === 19;
                const isOperator = ["÷", "×", "−", "+"].includes(key);

                return (
                  <button
                    key={`${key}-${index}`}
                    className={`key ${
                      isEquals ? "equals" : ""
                    } ${isOperator ? "operator" : ""} ${
                      key === "AC" ? "danger" : ""
                    } ${key === "DEL" ? "utility" : ""} ${
                      key === "0" ? "zero" : ""
                    }`}
                    onClick={() => handleKey(key)}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="history-card">
            <div className="history-header">
              <h2 className="history-title">Calculation History</h2>

              {history.length > 0 && (
                <button
                  className="history-clear"
                  onClick={() => setHistory([])}
                >
                  Clear history
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="history-empty">
                Your recent calculations will appear here.
              </div>
            ) : (
              <div className="history-list">
                {history.map((item, index) => (
                  <button
                    key={`${item.expression}-${index}`}
                    className="history-item"
                    onClick={() => {
                      setExpression(item.expression);
                      setDisplay(item.result.replace(/,/g, ""));
                    }}
                  >
                    <div className="history-expression">
                      {item.expression}
                    </div>

                    <div className="history-result">= {item.result}</div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>

        <section className="features">
          <article className="feature-card">
            <h3>Fast calculations</h3>
            <p>
              Instant results with keyboard and touch-friendly controls.
            </p>
          </article>

          <article className="feature-card">
            <h3>Calculation history</h3>
            <p>
              Your recent calculations are saved locally on your device.
            </p>
          </article>

          <article className="feature-card">
            <h3>Built to expand</h3>
            <p>
              Finance, business, GST, EMI, SIP and conversion tools will be
              added next.
            </p>
          </article>
        </section>

        <footer className="footer">
          © 2026 CalcPro. Built for fast and accurate calculations.
        </footer>
      </main>
    </div>
  );
}
