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
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);

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

      const strResult = String(rawResult);
      setExpression(strResult);
      setCursorPos(strResult.length);
      setIsCalculated(true);
    } catch {
      setDisplay("Error");
      setIsCalculated(true);
    }
  }, [expression, formatNumber]);

  // Sync cursor selection back to input
  const updateInputCursor = (newPos: number) => {
    setCursorPos(newPos);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPos, newPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  const moveCursor = (direction: "left" | "right") => {
    triggerHaptic();
    const current = inputRef.current ? inputRef.current.selectionStart ?? cursorPos : cursorPos;
    const newPos = direction === "left" ? Math.max(0, current - 1) : Math.min(expression.length, current + 1);
    updateInputCursor(newPos);
  };

  const deleteHistoryItem = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    triggerHaptic();
    const val = item.result.replace(/,/g, "");
    setExpression(val);
    setDisplay(item.result);
    setCursorPos(val.length);
    setIsCalculated(true);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(item.result);
      setCopiedText("Copied!");
      setTimeout(() => setCopiedText(null), 1500);
    }
  };

  const press = useCallback(
    (key: string) => {
      triggerHaptic();

      // Current cursor position detect
      const currentPos = inputRef.current ? inputRef.current.selectionStart ?? cursorPos : cursorPos;

      if (key === "AC") {
        setExpression("");
        setDisplay("0");
        setCursorPos(0);
        setIsCalculated(false);
        return;
      }

      if (key === "DEL") {
        if (isCalculated) {
          setExpression("");
          setDisplay("0");
          setCursorPos(0);
          setIsCalculated(false);
          return;
        }

        if (currentPos === 0) return;

        // In-place character delete at cursor
        const next = expression.slice(0, currentPos - 1) + expression.slice(currentPos);
        setExpression(next);
        setDisplay(next || "0");
        updateInputCursor(currentPos - 1);
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
          const str = String(result);
          setExpression(str);
          setDisplay(formatNumber(result));
          setCursorPos(str.length);
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
          const str = String(result);
          setExpression(str);
          setDisplay(formatNumber(result));
          setCursorPos(str.length);
          setIsCalculated(true);
        }
        return;
      }

      if (key === "π") {
        const val = String(Math.PI);
        if (isCalculated || !expression) {
          setExpression(val);
          setDisplay("π");
          setCursorPos(val.length);
        } else {
          const next = expression.slice(0, currentPos) + val + expression.slice(currentPos);
          setExpression(next);
          setDisplay(next);
          updateInputCursor(currentPos + val.length);
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

          const str = String(result);
          setExpression(str);
          setDisplay(formatNumber(result));
          setCursorPos(str.length);
          setIsCalculated(true);
        }
        return;
      }

      // Operators (+, -, *, /, %)
      const operators = ["+", "-", "*", "/", "%"];
      if (operators.includes(key)) {
        setIsCalculated(false);
        if (!expression && key !== "-") return;

        const prevChar = expression[currentPos - 1];
        if (operators.includes(prevChar)) {
          // Replace operator before cursor
          const next = expression.slice(0, currentPos - 1) + key + expression.slice(currentPos);
          setExpression(next);
          setDisplay(next);
          updateInputCursor(currentPos);
        } else {
          // Insert operator at cursor
          const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
          setExpression(next);
          setDisplay(next);
          updateInputCursor(currentPos + key.length);
        }
        return;
      }

      // Decimal (.) Prevention for segment
      if (key === ".") {
        const leftExpr = expression.slice(0, currentPos);
        const rightExpr = expression.slice(currentPos);
        const lastLeftSegment = leftExpr.split(/[+\-*/%]/).pop() || "";
        const nextRightSegment = rightExpr.split(/[+\-*/%]/)[0] || "";
        if (lastLeftSegment.includes(".") || nextRightSegment.includes(".")) return;
      }

      // Continuous fresh start after '='
      if (isCalculated) {
        setIsCalculated(false);
        setExpression(key);
        setDisplay(key);
        setCursorPos(key.length);
        return;
      }

      // In-place digit insertion at cursor
      const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
      setExpression(next);
      setDisplay(next);
      updateInputCursor(currentPos + key.length);
    },
    [expression, display, cursorPos, isCalculated, calculate, formatNumber]
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
      } else if (key === "ArrowLeft") {
        moveCursor("left");
      } else if (key === "ArrowRight") {
        moveCursor("right");
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

      {/* Screen with Direct Tap & In-Place Editing */}
      <section className="calculator-screen">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          {/* Cursor Navigation arrows for quick mobile editing */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => moveCursor("left")}
              aria-label="Move cursor left"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "inherit",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "12px",
              }}
            >
              ◀
            </button>
            <button
              onClick={() => moveCursor("right")}
              aria-label="Move cursor right"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "inherit",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "12px",
              }}
            >
              ▶
            </button>
          </div>

          <small style={{ color: "#71717a", fontSize: "10px" }}>Tap text to edit</small>
        </div>

        {/* Interactive Expression Input */}
        <input
          ref={inputRef}
          type="text"
          value={expression}
          onChange={(e) => {
            const val = e.target.value;
            setExpression(val);
            setDisplay(val || "0");
            setCursorPos(e.target.selectionStart ?? val.length);
          }}
          onSelect={(e) => {
            const target = e.target as HTMLInputElement;
            setCursorPos(target.selectionStart ?? expression.length);
          }}
          placeholder="0"
          className="expression"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            textAlign: "right",
            width: "100%",
            color: "inherit",
            cursor: "text",
          }}
        />

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Recent Calculations</span>
            {copiedText && (
              <small style={{ color: "#22c55e", fontSize: "11px", fontWeight: "600" }}>
                {copiedText}
              </small>
            )}
          </div>

          {history.length > 0 && (
            <button
              className="clear-history"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("calcpro-history");
              }}
            >
              Clear All
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
            {history.slice(0, 15).map((item, index) => (
              <div
                className="history-item"
                key={`${item.expression}-${index}`}
                onClick={() => handleHistoryItemClick(item)}
                title="Tap to load & copy"
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                  <span>{item.expression}</span>
                  <strong>{item.result}</strong>
                </div>

                <button
                  className="clear-history"
                  onClick={(e) => deleteHistoryItem(e, index)}
                  aria-label="Delete calculation"
                  style={{
                    fontSize: "18px",
                    lineHeight: "1",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
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
