"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

type HistoryItem = {
  expression: string;
  result: string;
};

export default function Home() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scientific, setScientific] = useState(false);
  const [dark, setDark] = useState(true);
  const [locale, setLocale] = useState("en-IN");
  const [isCalculated, setIsCalculated] = useState(false);

  // Settings & History Load
  useEffect(() => {
    const savedTheme = localStorage.getItem("calcpro-theme");
    if (savedTheme !== null) setDark(savedTheme === "dark");

    const savedFormat = localStorage.getItem("calcpro-format");
    if (savedFormat) setLocale(savedFormat);

    const savedHistory = localStorage.getItem("calcpro-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Sync History
  useEffect(() => {
    localStorage.setItem("calcpro-history", JSON.stringify(history));
  }, [history]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const vibe = localStorage.getItem("calcpro-vibration");
      if (vibe !== "false") {
        navigator.vibrate(15);
      }
    }
  };

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    localStorage.setItem("calcpro-theme", nextDark ? "dark" : "light");
  };

  const formatNumber = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return "Error";
      return Number(value.toFixed(10)).toLocaleString(locale, {
        maximumFractionDigits: 10,
      });
    },
    [locale]
  );

  // Accurate Percentage & Safe Math Engine
  const evaluateExpression = (expr: string): number => {
    let sanitized = expr.replace(/,/g, "").trim();

    // Clean trailing operators
    sanitized = sanitized.replace(/[+\-*/%]+$/, "");
    if (!sanitized) return 0;

    // Handle percentage logic like 200 + 10% => 200 + (200 * 0.1)
    sanitized = sanitized.replace(
      /(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g,
      "($1 $2 ($1 * $3 / 100))"
    );
    // Simple percentage like 50 * 10% => 50 * (10 / 100)
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, "($1 / 100)");

    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      throw new Error("Invalid Syntax");
    }

    const res = Function(`"use strict"; return (${sanitized})`)();
    return Number(res);
  };

  const calculate = useCallback(() => {
    if (!expression) return;

    try {
      const rawResult = evaluateExpression(expression);
      const formatted = formatNumber(rawResult);

      setDisplay(formatted);
      setHistory((prev) =>
        [
          {
            expression,
            result: formatted,
          },
          ...prev,
        ].slice(0, 30)
      );

      setExpression(String(rawResult));
      setIsCalculated(true);
    } catch {
      setDisplay("Error");
      setIsCalculated(true);
    }
  }, [expression, formatNumber]);

  const press = useCallback(
    (key: string) => {
      triggerHaptic();

      if (key === "AC") {
        setExpression("");
        setDisplay("0");
        setIsCalculated(false);
        return;
      }

      if (key === "DEL") {
        if (isCalculated) {
          setExpression("");
          setDisplay("0");
          setIsCalculated(false);
          return;
        }
        const next = expression.slice(0, -1);
        setExpression(next);
        setDisplay(next || "0");
        return;
      }

      if (key === "=") {
        calculate();
        return;
      }

      // Quick Scientific Functions
      if (key === "√") {
        const value = Number(expression || display.replace(/,/g, ""));
        if (!Number.isNaN(value) && value >= 0) {
          const result = Math.sqrt(value);
          setExpression(String(result));
          setDisplay(formatNumber(result));
          setIsCalculated(true);
        } else {
          setDisplay("Error");
        }
        return;
      }

      if (key === "x²") {
        const value = Number(expression || display.replace(/,/g, ""));
        if (!Number.isNaN(value)) {
          const result = value ** 2;
          setExpression(String(result));
          setDisplay(formatNumber(result));
          setIsCalculated(true);
        }
        return;
      }

      if (key === "π") {
        const val = String(Math.PI);
        if (isCalculated || !expression) {
          setExpression(val);
          setDisplay("π");
        } else {
          setExpression((prev) => prev + val);
          setDisplay((prev) => (prev === "0" ? "π" : prev + "π"));
        }
        setIsCalculated(false);
        return;
      }

      if (key === "sin" || key === "cos" || key === "tan") {
        const value = Number(expression || display.replace(/,/g, ""));
        if (!Number.isNaN(value)) {
          const radians = (value * Math.PI) / 180;
          const result =
            key === "sin"
              ? Math.sin(radians)
              : key === "cos"
              ? Math.cos(radians)
              : Math.tan(radians);

          setExpression(String(result));
          setDisplay(formatNumber(result));
          setIsCalculated(true);
        }
        return;
      }

      // Operators
      const operators = ["+", "-", "*", "/", "%"];
      if (operators.includes(key)) {
        setIsCalculated(false);
        if (!expression && key !== "-") return;

        const last = expression.slice(-1);
        if (operators.includes(last)) {
          setExpression(expression.slice(0, -1) + key);
        } else {
          setExpression(expression + key);
        }
        return;
      }

      // Decimal (.) Prevention for multiples in same segment
      if (key === ".") {
        const currentSegment = expression.split(/[+\-*/%]/).pop() || "";
        if (currentSegment.includes(".")) return;
      }

      // Continuous Calculation handling: naye digit par fresh start
      if (isCalculated) {
        setIsCalculated(false);
        setExpression(key);
        setDisplay(key);
        return;
      }

      const next = expression + key;
      setExpression(next);
      setDisplay(next);
    },
    [expression, display, isCalculated, calculate, formatNumber]
  );

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const key = event.key;

      if (/^[0-9.]$/.test(key)) {
        press(key);
      } else if (["+", "-", "*", "/", "%"].includes(key)) {
        press(key);
      } else if (key === "Enter" || key === "=") {
        press("=");
      } else if (key === "Backspace") {
        press("DEL");
      } else if (key === "Escape") {
        press("AC");
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [press]);

  const basicKeys = [
    "AC",
    "DEL",
    "%",
    "/",
    "7",
    "8",
    "9",
    "*",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];

  const scientificKeys = ["sin", "cos", "tan", "√", "x²", "π"];

  return (
    <main className={`app ${dark ? "dark" : "light"}`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CalcPro</h1>
            <p>Smart Calculator</p>
          </div>
        </div>

        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {dark ? "☼" : "☾"}
        </button>
      </header>

      <section className="calculator-screen">
        <div className="expression">{expression || "0"}</div>
        <div className="result">{display}</div>
      </section>

      <div className="mode-row">
        <button
          className={!scientific ? "mode active" : "mode"}
          onClick={() => setScientific(false)}
        >
          Basic
        </button>

        <button
          className={scientific ? "mode active" : "mode"}
          onClick={() => setScientific(true)}
        >
          Scientific
        </button>
      </div>

      {scientific && (
        <section className="scientific-panel">
          {scientificKeys.map((key) => (
            <button
              key={key}
              className="scientific-key"
              onClick={() => press(key)}
            >
              {key}
            </button>
          ))}
        </section>
      )}

      <section className="keypad">
        {basicKeys.map((key) => {
          const isOperator = ["+", "-", "*", "/", "%"].includes(key);
          const isDanger = key === "AC";
          const isUtility = key === "DEL";
          const isEqual = key === "=";

          return (
            <button
              key={key}
              className={[
                "key",
                isOperator ? "operator" : "",
                isDanger ? "danger" : "",
                isUtility ? "utility" : "",
                isEqual ? "equals" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => press(key)}
            >
              {key === "*" ? "×" : key === "/" ? "÷" : key}
            </button>
          );
        })}
      </section>

      <section className="quick-tools">
        <div className="section-title">
          <span>Quick Tools</span>
          <Link href="/tools/" className="small-text">
            View All
          </Link>
        </div>

        <div className="tool-grid">
          <Link href="/tools/emi/">EMI</Link>
          <Link href="/tools/gst/">GST</Link>
          <Link href="/tools/sip/">SIP</Link>
          <Link href="/tools/simple-interest/">Interest</Link>
        </div>
      </section>

      <section className="history-section" id="history">
        <div className="section-title">
          <span>Recent Calculations</span>

          {history.length > 0 && (
            <button
              className="clear-history"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("calcpro-history");
              }}
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">=</div>
            <p>No calculations yet</p>
            <span>Your recent calculations will appear here.</span>
          </div>
        ) : (
          <div className="history-list">
            {history.slice(0, 8).map((item, index) => (
              <button
                className="history-item"
                key={`${item.expression}-${index}`}
                onClick={() => {
                  setExpression(item.result.replace(/,/g, ""));
                  setDisplay(item.result);
                  setIsCalculated(true);
                }}
              >
                <span>{item.expression}</span>
                <strong>{item.result}</strong>
              </button>
            ))}
          </div>
        )}
      </section>

      <nav className="bottom-nav">
        <Link href="/" className="nav-item active">
          <span>⌕</span>
          <small>Calculator</small>
        </Link>

        <Link href="/tools/" className="nav-item">
          <span>+</span>
          <small>Tools</small>
        </Link>

        <a href="#history" className="nav-item">
          <span>≡</span>
          <small>History</small>
        </a>

        <Link href="/settings/" className="nav-item">
          <span>⚙</span>
          <small>Settings</small>
        </Link>
      </nav>
    </main>
  );
}
