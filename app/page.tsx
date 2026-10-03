"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

type HistoryItem = {
  expression: string;
  result: string;
};

type VaultFile = {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  size: number;
  date: string;
};

// Web Audio API Lag-Free Click Sound
const playKeySound = () => {
  if (typeof window === "undefined") return;
  const isSoundEnabled = localStorage.getItem("calcpro-sound") !== "false";
  if (!isSoundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch {
    // Audio unsupported fallback
  }
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

  // Vault States
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [vaultPasscode, setVaultPasscode] = useState("1234"); // Default Secret PIN
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);

  // Settings & Vault Load
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

    const savedPin = localStorage.getItem("calcpro-vault-pin");
    if (savedPin) setVaultPasscode(savedPin);

    const savedVault = localStorage.getItem("calcpro-vault-files");
    if (savedVault) {
      try {
        setVaultFiles(JSON.parse(savedVault));
      } catch {
        setVaultFiles([]);
      }
    }
  }, []);

  // Sync History & Vault
  useEffect(() => {
    localStorage.setItem("calcpro-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("calcpro-vault-files", JSON.stringify(vaultFiles));
  }, [vaultFiles]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const vibe = localStorage.getItem("calcpro-vibration");
      if (vibe !== "false") {
        navigator.vibrate(12);
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

  const evaluateExpression = (expr: string): number => {
    let sanitized = expr.replace(/,/g, "").trim();
    sanitized = sanitized.replace(/[+\-*/%]+$/, "");
    if (!sanitized) return 0;

    sanitized = sanitized.replace(
      /(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g,
      "($1 $2 ($1 * $3 / 100))"
    );
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, "($1 / 100)");

    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      throw new Error("Invalid Syntax");
    }

    const res = Function(`"use strict"; return (${sanitized})`)();
    return Number(res);
  };

  const calculate = useCallback(() => {
    if (!expression) return;

    // Check Secret PIN for Vault trigger (e.g. typing 1234 and pressing '=')
    if (expression.trim() === vaultPasscode) {
      triggerHaptic();
      setVaultOpen(true);
      setExpression("");
      setDisplay("0");
      setCursorPos(0);
      return;
    }

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
  }, [expression, vaultPasscode, formatNumber]);

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
    playKeySound();
    const current = inputRef.current ? inputRef.current.selectionStart ?? cursorPos : cursorPos;
    const newPos = direction === "left" ? Math.max(0, current - 1) : Math.min(expression.length, current + 1);
    updateInputCursor(newPos);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newFile: VaultFile = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          dataUrl: base64,
          size: file.size,
          date: new Date().toLocaleDateString(),
        };
        setVaultFiles((prev) => [newFile, ...prev]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const deleteVaultFile = (id: string) => {
    setVaultFiles((prev) => prev.filter((f) => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const press = useCallback(
    (key: string) => {
      triggerHaptic();
      playKeySound();

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

      const operators = ["+", "-", "*", "/", "%"];
      if (operators.includes(key)) {
        setIsCalculated(false);
        if (!expression && key !== "-") return;

        const prevChar = expression[currentPos - 1];
        if (operators.includes(prevChar)) {
          const next = expression.slice(0, currentPos - 1) + key + expression.slice(currentPos);
          setExpression(next);
          setDisplay(next);
          updateInputCursor(currentPos);
        } else {
          const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
          setExpression(next);
          setDisplay(next);
          updateInputCursor(currentPos + key.length);
        }
        return;
      }

      if (key === ".") {
        const leftExpr = expression.slice(0, currentPos);
        const rightExpr = expression.slice(currentPos);
        const lastLeftSegment = leftExpr.split(/[+\-*/%]/).pop() || "";
        const nextRightSegment = rightExpr.split(/[+\-*/%]/)[0] || "";
        if (lastLeftSegment.includes(".") || nextRightSegment.includes(".")) return;
      }

      if (isCalculated) {
        setIsCalculated(false);
        setExpression(key);
        setDisplay(key);
        setCursorPos(key.length);
        return;
      }

      const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
      setExpression(next);
      setDisplay(next);
      updateInputCursor(currentPos + key.length);
    },
    [expression, display, cursorPos, isCalculated, calculate, formatNumber]
  );

  const basicKeys = [
    "AC", "DEL", "%", "/",
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "=",
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

      {/* Screen */}
      <section className="calculator-screen">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
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

      {/* Mode Switch */}
      <div className="mode-row">
        <button
          className={!scientific ? "mode active" : "mode"}
          onClick={() => {
            playKeySound();
            setScientific(false);
          }}
        >
          Basic
        </button>

        <button
          className={scientific ? "mode active" : "mode"}
          onClick={() => {
            playKeySound();
            setScientific(true);
          }}
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

      {/* Keypad */}
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

      {/* Quick Tools */}
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

      {/* History */}
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
                onClick={() => {
                  triggerHaptic();
                  playKeySound();
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
                }}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                  <span>{item.expression}</span>
                  <strong>{item.result}</strong>
                </div>

                <button
                  className="clear-history"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHistory((prev) => prev.filter((_, idx) => idx !== index));
                  }}
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

      {/* Secret Vault Overlay (Calculator Vault Modal) */}
      {vaultOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            padding: "20px 16px",
            color: "#fff",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔒</span> Secret Vault
              </h2>
              <small style={{ color: "#a1a1aa" }}>Hidden Photos, Videos & Files</small>
            </div>

            <button
              onClick={() => setVaultOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                border: "none",
                color: "#fff",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Hide New File / Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* Hidden Items Grid */}
          {vaultFiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#71717a" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📁</div>
              <p style={{ margin: 0 }}>Your Vault is empty.</p>
              <small>Click above to hide confidential photos or files.</small>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "12px",
              }}
            >
              {vaultFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      onClick={() => setPreviewFile(file)}
                      style={{ width: "100%", height: "110px", objectFit: "cover", cursor: "pointer" }}
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      src={file.dataUrl}
                      onClick={() => setPreviewFile(file)}
                      style={{ width: "100%", height: "110px", objectFit: "cover", cursor: "pointer" }}
                    />
                  ) : (
                    <div
                      onClick={() => setPreviewFile(file)}
                      style={{
                        height: "110px",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "36px",
                        cursor: "pointer",
                        background: "rgba(0,0,0,0.3)",
                      }}
                    >
                      📄
                    </div>
                  )}

                  <div style={{ padding: "8px", fontSize: "11px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {file.name}
                    </div>
                    <div style={{ color: "#71717a", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                      <span>{(file.size / 1024).toFixed(0)} KB</span>
                      <button
                        onClick={() => deleteVaultFile(file.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Screen File Preview Modal */}
          {previewFile && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                padding: "20px",
              }}
            >
              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕ Close
              </button>

              {previewFile.type.startsWith("image/") ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px" }}
                />
              ) : previewFile.type.startsWith("video/") ? (
                <video
                  src={previewFile.dataUrl}
                  controls
                  autoPlay
                  style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: "60px", marginBottom: "16px" }}>📄</div>
                  <p>{previewFile.name}</p>
                  <a
                    href={previewFile.dataUrl}
                    download={previewFile.name}
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      background: "#2563eb",
                      color: "#fff",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      textDecoration: "none",
                    }}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Nav */}
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
