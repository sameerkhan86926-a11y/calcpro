"use client";

import { useEffect, useState } from "react";
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

useEffect(() => {
const saved = localStorage.getItem("calcpro-history");

if (saved) {
  try {
    setHistory(JSON.parse(saved));
  } catch {
    setHistory([]);
  }
}

}, []);

useEffect(() => {
localStorage.setItem(
"calcpro-history",
JSON.stringify(history)
);
}, [history]);

const formatNumber = (value: number) => {
if (!Number.isFinite(value)) return "Error";

return Number(value.toFixed(10)).toLocaleString("en-IN", {
  maximumFractionDigits: 10,
});

};

const calculate = () => {
if (!expression) return;

try {
  const safeExpression = expression.replace(/,/g, "");

  if (!/^[0-9+\-*/().%\s]+$/.test(safeExpression)) {
    throw new Error("Invalid");
  }

  const result = Function(
    `"use strict"; return (${safeExpression})`
  )();

  const formatted = formatNumber(Number(result));

  setDisplay(formatted);

  setHistory((prev) => [
    {
      expression,
      result: formatted,
    },
    ...prev,
  ].slice(0, 30));

  setExpression(String(result));
} catch {
  setDisplay("Error");
}

};

const press = (key: string) => {
if (key === "AC") {
setExpression("");
setDisplay("0");
return;
}

if (key === "DEL") {
  const next = expression.slice(0, -1);

  setExpression(next);
  setDisplay(next || "0");
  return;
}

if (key === "=") {
  calculate();
  return;
}

if (key === "√") {
  const value = Number(
    expression || display.replace(/,/g, "")
  );

  if (!Number.isNaN(value)) {
    const result = Math.sqrt(value);

    setExpression(String(result));
    setDisplay(formatNumber(result));
  }

  return;
}

if (key === "x²") {
  const value = Number(
    expression || display.replace(/,/g, "")
  );

  if (!Number.isNaN(value)) {
    const result = value ** 2;

    setExpression(String(result));
    setDisplay(formatNumber(result));
  }

  return;
}

if (key === "π") {
  setExpression((prev) => prev + Math.PI);

  setDisplay((prev) =>
    prev === "0" ? "π" : prev + "π"
  );

  return;
}

if (
  key === "sin" ||
  key === "cos" ||
  key === "tan"
) {
  const value = Number(
    expression || display.replace(/,/g, "")
  );

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
  }

  return;
}

const operators = ["+", "-", "*", "/", "%"];

if (operators.includes(key)) {
  if (!expression && key !== "-") return;

  const last = expression.slice(-1);

  if (operators.includes(last)) {
    setExpression(
      expression.slice(0, -1) + key
    );
  } else {
    setExpression(expression + key);
  }

  return;
}

const next = expression + key;

setExpression(next);
setDisplay(next);

};

useEffect(() => {
const handleKeyboard = (event: KeyboardEvent) => {
const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    press(key);
  } else if (
    ["+", "-", "*", "/", "%"].includes(key)
  ) {
    press(key);
  } else if (
    key === "Enter" ||
    key === "="
  ) {
    press("=");
  } else if (key === "Backspace") {
    press("DEL");
  } else if (key === "Escape") {
    press("AC");
  }
};

window.addEventListener(
  "keydown",
  handleKeyboard
);

return () => {
  window.removeEventListener(
    "keydown",
    handleKeyboard
  );
};

});

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

const scientificKeys = [
"sin",
"cos",
"tan",
"√",
"x²",
"π",
];

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
      onClick={() => setDark((value) => !value)}
      aria-label="Toggle theme"
    >
      {dark ? "Light" : "Dark"}
    </button>
  </header>

  <section className="calculator-screen">
    <div className="expression">
      {expression || "0"}
    </div>

    <div className="result">
      {display}
    </div>
  </section>

  <div className="mode-row">
    <button
      className={
        !scientific
          ? "mode active"
          : "mode"
      }
      onClick={() => setScientific(false)}
    >
      Basic
    </button>

    <button
      className={
        scientific
          ? "mode active"
          : "mode"
      }
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
      const isOperator = [
        "+",
        "-",
        "*",
        "/",
        "%",
      ].includes(key);

      const isDanger = key === "AC";
      const isUtility = key === "DEL";
      const isEqual = key === "=";

      return (
        <button
          key={key}
          className={[
            "key",
            isOperator
              ? "operator"
              : "",
            isDanger
              ? "danger"
              : "",
            isUtility
              ? "utility"
              : "",
            isEqual
              ? "equals"
              : "",
          ].join(" ")}
          onClick={() => press(key)}
        >
          {key === "*"
            ? "×"
            : key === "/"
              ? "÷"
              : key}
        </button>
      );
    })}
  </section>

  <section className="quick-tools">
    <div className="section-title">
      <span>Quick Tools</span>

      <Link
        href="/tools/"
        className="small-text"
      >
        View All
      </Link>
    </div>

    <div className="tool-grid">

      <Link href="/tools/emi/">
        EMI
      </Link>

      <Link href="/tools/gst/">
        GST
      </Link>

      <Link href="/tools/sip/">
        SIP
      </Link>

      <Link href="/tools/simple-interest/">
        Interest
      </Link>

    </div>
  </section>

  <section
    className="history-section"
    id="history"
  >
    <div className="section-title">
      <span>Recent Calculations</span>

      {history.length > 0 && (
        <button
          className="clear-history"
          onClick={() => setHistory([])}
        >
          Clear
        </button>
      )}
    </div>

    {history.length === 0 ? (
      <div className="empty-history">
        <div className="empty-icon">=</div>

        <p>No calculations yet</p>

        <span>
          Your recent calculations will
          appear here.
        </span>
      </div>
    ) : (
      <div className="history-list">
        {history
          .slice(0, 8)
          .map((item, index) => (
            <button
              className="history-item"
              key={`${item.expression}-${index}`}
              onClick={() => {
                setExpression(
                  item.result.replace(/,/g, "")
                );

                setDisplay(item.result);
              }}
            >
              <span>
                {item.expression}
              </span>

              <strong>
                {item.result}
              </strong>
            </button>
          ))}
      </div>
    )}
  </section>

  <nav className="bottom-nav">

    <Link
      href="/"
      className="nav-item active"
    >
      <span>Calculator</span>
      <small>Home</small>
    </Link>

    <Link
      href="/tools/"
      className="nav-item"
    >
      <span>Tools</span>
      <small>Calculators</small>
    </Link>

    <a
      href="#history"
      className="nav-item"
    >
      <span>History</span>
      <small>Recent</small>
    </a>

    <button
      className="nav-item"
      onClick={() => setDark((value) => !value)}
    >
      <span>Theme</span>
      <small>
        {dark ? "Dark" : "Light"}
      </small>
    </button>

  </nav>

</main>
);
}
