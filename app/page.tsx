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
  blob: Blob;
  size: number;
  date: string;
};

// ---------------- IndexedDB Safe Storage Engine ----------------
const DB_NAME = "CalcProVaultDB";
const STORE_NAME = "hidden_files";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB not supported");
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToDB = async (file: VaultFile) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(file);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getFilesFromDB = async (): Promise<VaultFile[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const deleteFileFromDB = async (id: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// ---------------- Web Audio Feedback ----------------
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
    // Audio fallback
  }
};

// ---------------- Math Helper ----------------
const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) res *= i;
  return res;
};

// ---------------- Real Thumbnail Component ----------------
function VaultThumbnail({
  file,
  onClick,
}: {
  file: VaultFile;
  onClick: () => void;
}) {
  const [thumbUrl, setThumbUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(file.blob);
    setThumbUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file.blob]);

  if (file.type.startsWith("image/")) {
    return (
      <img
        src={thumbUrl}
        alt={file.name}
        onClick={onClick}
        style={{
          width: "100%",
          height: "120px",
          objectFit: "cover",
          cursor: "pointer",
          display: "block",
        }}
      />
    );
  }

  if (file.type.startsWith("video/")) {
    return (
      <div
        onClick={onClick}
        style={{
          position: "relative",
          width: "100%",
          height: "120px",
          cursor: "pointer",
          background: "#000",
        }}
      >
        <video
          src={thumbUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          preload="metadata"
        />
        <span
          style={{
            position: "absolute",
            bottom: "6px",
            right: "6px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          ▶ Video
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        height: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: "rgba(255,255,255,0.04)",
        gap: "6px",
      }}
    >
      <div
        style={{
          background: "#ef4444",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "bold",
          padding: "3px 8px",
          borderRadius: "4px",
          textTransform: "uppercase",
        }}
      >
        {file.name.split(".").pop() || "FILE"}
      </div>
      <small style={{ color: "#a1a1aa", fontSize: "11px" }}>Document</small>
    </div>
  );
}

export default function Home() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scientific, setScientific] = useState(false);
  const [isRad, setIsRad] = useState(false); // DEG vs RAD toggle
  const [isSecond, setIsSecond] = useState(false); // 2nd function toggle (sin vs sin⁻¹)
  const [dark, setDark] = useState(true);
  const [locale, setLocale] = useState("en-IN");
  const [isCalculated, setIsCalculated] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Vault States
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [vaultPasscode, setVaultPasscode] = useState<string | null>(null);
  const [showVaultIntro, setShowVaultIntro] = useState(false);

  // PIN Setup States
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [pinError, setPinError] = useState("");

  // Recovery States
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  const [previewFile, setPreviewFile] = useState<{ url: string; file: VaultFile } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);

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
    if (savedPin) {
      setVaultPasscode(savedPin);
    } else {
      setVaultPasscode(null);
    }

    const introShown = localStorage.getItem("calcpro-vault-intro");
    if (!introShown) {
      setShowVaultIntro(true);
    }

    getFilesFromDB()
      .then((files) => setVaultFiles(files))
      .catch((err) => console.error("Could not load vault items", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("calcpro-history", JSON.stringify(history));
  }, [history]);

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

  const evaluateExpression = useCallback((expr: string): number => {
    let sanitized = expr.replace(/,/g, "").trim();
    sanitized = sanitized.replace(/[+\-*/%^]+$/, "");
    if (!sanitized) return 0;

    // Power operator replace (^ -> **)
    sanitized = sanitized.replace(/\^/g, "**");

    // Percentage substitutions
    sanitized = sanitized.replace(
      /(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g,
      "($1 $2 ($1 * $3 / 100))"
    );
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, "($1 / 100)");

    if (!/^[0-9+\-*/().\s*^]+$/.test(sanitized)) {
      throw new Error("Invalid Syntax");
    }

    const res = Function(`"use strict"; return (${sanitized})`)();
    return Number(res);
  }, []);

  // REAL-TIME LIVE CALCULATION
  useEffect(() => {
    if (!expression) {
      if (!isCalculated) setDisplay("0");
      return;
    }

    if (isCalculated) return;

    const cleanExpr = expression.trim();
    if (cleanExpr === "11223344" || (vaultPasscode && cleanExpr === vaultPasscode)) {
      return;
    }

    try {
      const sanitized = cleanExpr.replace(/[+\-*/%^]+$/, "");
      if (!sanitized) return;

      const liveVal = evaluateExpression(sanitized);
      if (Number.isFinite(liveVal)) {
        setDisplay(formatNumber(liveVal));
      }
    } catch {
      // Incomplete syntax
    }
  }, [expression, isCalculated, vaultPasscode, evaluateExpression, formatNumber]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [expression]);

  const handleLogoTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      triggerHaptic();
      if (!vaultPasscode) {
        setIsSettingPin(true);
      } else {
        setIsRecovering(true);
      }
    }, 1800);
  };

  const handleLogoTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleCloseIntro = () => {
    localStorage.setItem("calcpro-vault-intro", "true");
    setShowVaultIntro(false);
  };

  const handleSaveInitialPin = () => {
    if (newPin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    if (!securityAnswer.trim()) {
      setPinError("Please provide a recovery answer");
      return;
    }

    localStorage.setItem("calcpro-vault-pin", newPin);
    localStorage.setItem("calcpro-vault-answer", securityAnswer.trim().toLowerCase());
    setVaultPasscode(newPin);
    setIsSettingPin(false);
    setNewPin("");
    setConfirmPin("");
    setSecurityAnswer("");
    setPinError("");
    setVaultOpen(true);
  };

  const handleRecoverPin = () => {
    const savedAnswer = localStorage.getItem("calcpro-vault-answer") || "";
    if (recoveryInput.trim().toLowerCase() !== savedAnswer) {
      setRecoveryError("Incorrect answer. Please try again.");
      return;
    }

    if (resetNewPin.length < 4) {
      setRecoveryError("New PIN must be at least 4 digits");
      return;
    }

    localStorage.setItem("calcpro-vault-pin", resetNewPin);
    setVaultPasscode(resetNewPin);
    setIsRecovering(false);
    setRecoveryInput("");
    setResetNewPin("");
    setRecoveryError("");
    setVaultOpen(true);
  };

  const calculate = useCallback(() => {
    if (!expression) return;
    const cleanExpr = expression.trim();

    if (cleanExpr === "11223344") {
      triggerHaptic();
      setExpression("");
      setDisplay("0");
      setCursorPos(0);
      setIsRecovering(true);
      return;
    }

    if (vaultPasscode && cleanExpr === vaultPasscode) {
      triggerHaptic();
      setVaultOpen(true);
      setExpression("");
      setDisplay("0");
      setCursorPos(0);
      return;
    }

    if (!vaultPasscode && cleanExpr === "1234") {
      triggerHaptic();
      setIsSettingPin(true);
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
  }, [expression, vaultPasscode, evaluateExpression, formatNumber]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    for (const file of fileList) {
      const newFile: VaultFile = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: file.type,
        blob: file,
        size: file.size,
        date: new Date().toLocaleDateString(),
      };

      try {
        await saveFileToDB(newFile);
        setVaultFiles((prev) => [newFile, ...prev]);
      } catch (err) {
        console.error("Storage error:", err);
      }
    }

    e.target.value = "";
  };

  const deleteVaultFile = async (id: string) => {
    try {
      await deleteFileFromDB(id);
      setVaultFiles((prev) => prev.filter((f) => f.id !== id));
      if (previewFile?.file.id === id) {
        URL.revokeObjectURL(previewFile.url);
        setPreviewFile(null);
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const openPreview = (file: VaultFile) => {
    const url = URL.createObjectURL(file.blob);
    setPreviewFile({ url, file });
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
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
        if (!next) setDisplay("0");
        updateInputCursor(currentPos - 1);
        return;
      }

      if (key === "=") {
        calculate();
        return;
      }

      // Constant: π
      if (key === "π") {
        const val = String(Math.PI);
        if (isCalculated || !expression) {
          setExpression(val);
          setCursorPos(val.length);
        } else {
          const next = expression.slice(0, currentPos) + val + expression.slice(currentPos);
          setExpression(next);
          updateInputCursor(currentPos + val.length);
        }
        setIsCalculated(false);
        return;
      }

      // Constant: e
      if (key === "e") {
        const val = String(Math.E);
        if (isCalculated || !expression) {
          setExpression(val);
          setCursorPos(val.length);
        } else {
          const next = expression.slice(0, currentPos) + val + expression.slice(currentPos);
          setExpression(next);
          updateInputCursor(currentPos + val.length);
        }
        setIsCalculated(false);
        return;
      }

      // Immediate Unary Scientific Functions
      const currentNum = Number(expression || display.replace(/,/g, ""));

      if (key === "√") {
        if (!Number.isNaN(currentNum) && currentNum >= 0) {
          const result = Math.sqrt(currentNum);
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
        if (!Number.isNaN(currentNum)) {
          const result = currentNum ** 2;
          const str = String(result);
          setExpression(str);
          setDisplay(formatNumber(result));
          setCursorPos(str.length);
          setIsCalculated(true);
        }
        return;
      }

      if (key === "n!") {
        if (!Number.isNaN(currentNum)) {
          const result = factorial(currentNum);
          if (Number.isFinite(result)) {
            const str = String(result);
            setExpression(str);
            setDisplay(formatNumber(result));
            setCursorPos(str.length);
            setIsCalculated(true);
          } else {
            setDisplay("Error");
          }
        }
        return;
      }

      if (key === "log") {
        if (!Number.isNaN(currentNum) && currentNum > 0) {
          const result = Math.log10(currentNum);
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

      if (key === "ln") {
        if (!Number.isNaN(currentNum) && currentNum > 0) {
          const result = Math.log(currentNum);
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

      // Trigonometry (Standard & Inverse with DEG/RAD Support)
      if (["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹"].includes(key)) {
        if (!Number.isNaN(currentNum)) {
          let result = 0;

          if (key === "sin" || key === "cos" || key === "tan") {
            const angleInRad = isRad ? currentNum : (currentNum * Math.PI) / 180;
            result =
              key === "sin"
                ? Math.sin(angleInRad)
                : key === "cos"
                ? Math.cos(angleInRad)
                : Math.tan(angleInRad);
          } else {
            // Inverse functions
            let radVal = 0;
            if (key === "sin⁻¹") radVal = Math.asin(currentNum);
            else if (key === "cos⁻¹") radVal = Math.acos(currentNum);
            else radVal = Math.atan(currentNum);

            result = isRad ? radVal : (radVal * 180) / Math.PI;
          }

          if (Number.isFinite(result)) {
            const str = String(result);
            setExpression(str);
            setDisplay(formatNumber(result));
            setCursorPos(str.length);
            setIsCalculated(true);
          } else {
            setDisplay("Error");
          }
        }
        return;
      }

      // Power / Exponent Operator (xʸ -> ^)
      if (key === "xʸ") {
        if (!expression) return;
        setIsCalculated(false);
        const next = expression.slice(0, currentPos) + "^" + expression.slice(currentPos);
        setExpression(next);
        updateInputCursor(currentPos + 1);
        return;
      }

      // Parentheses `(` and `)`
      if (key === "(" || key === ")") {
        setIsCalculated(false);
        const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
        setExpression(next);
        updateInputCursor(currentPos + 1);
        return;
      }

      // Standard Operators
      const operators = ["+", "-", "*", "/", "%", "^"];
      if (operators.includes(key)) {
        setIsCalculated(false);
        if (!expression && key !== "-") return;

        const prevChar = expression[currentPos - 1];
        if (operators.includes(prevChar)) {
          const next = expression.slice(0, currentPos - 1) + key + expression.slice(currentPos);
          setExpression(next);
          updateInputCursor(currentPos);
        } else {
          const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
          setExpression(next);
          updateInputCursor(currentPos + key.length);
        }
        return;
      }

      if (key === ".") {
        const leftExpr = expression.slice(0, currentPos);
        const rightExpr = expression.slice(currentPos);
        const lastLeftSegment = leftExpr.split(/[+\-*/%^()]/).pop() || "";
        const nextRightSegment = rightExpr.split(/[+\-*/%^()]/)[0] || "";
        if (lastLeftSegment.includes(".") || nextRightSegment.includes(".")) return;
      }

      if (isCalculated) {
        setIsCalculated(false);
        setExpression(key);
        setCursorPos(key.length);
        return;
      }

      const next = expression.slice(0, currentPos) + key + expression.slice(currentPos);
      setExpression(next);
      updateInputCursor(currentPos + key.length);
    },
    [expression, display, cursorPos, isCalculated, isRad, calculate, formatNumber]
  );

  const basicKeys = [
    "AC", "DEL", "%", "/",
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "=",
  ];

  return (
    <main className={`app ${dark ? "dark" : "light"}`}>
      {/* Header */}
      <header className="app-header">
  <div
    className="brand"
    onMouseDown={handleLogoTouchStart}
    onMouseUp={handleLogoTouchEnd}
    onTouchStart={handleLogoTouchStart}
    onTouchEnd={handleLogoTouchEnd}
    style={{ userSelect: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
    title="Long-press for secret vault"
  >
    <img
      src="/logo.svg"
      alt="CalcPro"
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        display: "block",
      }}
    />
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {scientific && (
              <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "bold" }}>
                {isRad ? "RAD" : "DEG"}
              </span>
            )}
            <small style={{ color: "#71717a", fontSize: "10px" }}>Tap text to edit</small>
          </div>
        </div>

        {/* Chhota Expression Input */}
        <input
          ref={inputRef}
          type="text"
          value={expression}
          onChange={(e) => {
            const val = e.target.value;
            setExpression(val);
            setIsCalculated(false);
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
            overflowX: "auto",
          }}
        />

        {/* Bada Live Result Number */}
        <div className="result">{display}</div>
      </section>

      {/* Mode Bar */}
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

      {/* Scientific Advanced Panel */}
      {scientific && (
        <section
          className="scientific-panel"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {/* Row 1: DEG/RAD toggle & 2nd mode */}
          <button
            className="scientific-key"
            onClick={() => {
              playKeySound();
              setIsRad(!isRad);
            }}
            style={{ fontWeight: "bold", color: "#38bdf8" }}
          >
            {isRad ? "RAD" : "DEG"}
          </button>

          <button
            className="scientific-key"
            onClick={() => {
              playKeySound();
              setIsSecond(!isSecond);
            }}
            style={{ color: isSecond ? "#38bdf8" : "inherit" }}
          >
            2nd
          </button>

          <button className="scientific-key" onClick={() => press("(")}>(</button>
          <button className="scientific-key" onClick={() => press(")")}>)</button>
          <button className="scientific-key" onClick={() => press("n!")}>n!</button>

          {/* Row 2: Trig functions */}
          <button
            className="scientific-key"
            onClick={() => press(isSecond ? "sin⁻¹" : "sin")}
          >
            {isSecond ? "sin⁻¹" : "sin"}
          </button>
          <button
            className="scientific-key"
            onClick={() => press(isSecond ? "cos⁻¹" : "cos")}
          >
            {isSecond ? "cos⁻¹" : "cos"}
          </button>
          <button
            className="scientific-key"
            onClick={() => press(isSecond ? "tan⁻¹" : "tan")}
          >
            {isSecond ? "tan⁻¹" : "tan"}
          </button>
          <button className="scientific-key" onClick={() => press("π")}>π</button>
          <button className="scientific-key" onClick={() => press("e")}>e</button>

          {/* Row 3: Powers & Logs */}
          <button className="scientific-key" onClick={() => press("√")}>√</button>
          <button className="scientific-key" onClick={() => press("x²")}>x²</button>
          <button className="scientific-key" onClick={() => press("xʸ")}>xʸ</button>
          <button className="scientific-key" onClick={() => press("log")}>log</button>
          <button className="scientific-key" onClick={() => press("ln")}>ln</button>
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

      {/* Discreet 1-Time User Onboarding Popup */}
      {showVaultIntro && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: dark ? "#18181b" : "#fff",
              color: dark ? "#fff" : "#18181b",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "340px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔐</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Private Space Included</h3>
            <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5", margin: "0 0 16px 0" }}>
              To access your secret vault anytime, enter <strong>1234</strong> and press <strong>=</strong>, or long-press the <strong>CalcPro</strong> title above.
            </p>
            <button
              onClick={handleCloseIntro}
              style={{
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Set Secret PIN Modal */}
      {isSettingPin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: dark ? "#18181b" : "#fff",
              color: dark ? "#fff" : "#18181b",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px" }}>Set Secret Vault PIN</h3>
            <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "14px" }}>
              Enter your secret PIN. Add a recovery answer in case you forget it.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="password"
                maxLength={8}
                placeholder="Enter 4-8 Digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                style={{
                  background: dark ? "#27272a" : "#f4f4f5",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "inherit",
                  fontSize: "15px",
                  textAlign: "center",
                  letterSpacing: "4px",
                }}
              />

              <input
                type="password"
                maxLength={8}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                style={{
                  background: dark ? "#27272a" : "#f4f4f5",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "inherit",
                  fontSize: "15px",
                  textAlign: "center",
                  letterSpacing: "4px",
                }}
              />

              <div style={{ textAlign: "left", marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "#a1a1aa" }}>Recovery: What is your birth city?</span>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    background: dark ? "#27272a" : "#f4f4f5",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    color: "inherit",
                    fontSize: "13px",
                  }}
                />
              </div>

              {pinError && (
                <small style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>
                  {pinError}
                </small>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  onClick={() => {
                    setIsSettingPin(false);
                    setNewPin("");
                    setConfirmPin("");
                    setSecurityAnswer("");
                    setPinError("");
                  }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid #3f3f46",
                    color: "inherit",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveInitialPin}
                  style={{
                    flex: 1,
                    background: "#2563eb",
                    border: "none",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Save PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Recovery Modal */}
      {isRecovering && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: dark ? "#18181b" : "#fff",
              color: dark ? "#fff" : "#18181b",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "360px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", fontSize: "18px" }}>🔑 PIN Recovery</h3>
            <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "16px" }}>
              Emergency code verified. Answer your security question to reset your PIN.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: "12px", color: "#a1a1aa" }}>Question: What is your birth city?</span>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    background: dark ? "#27272a" : "#f4f4f5",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    padding: "10px",
                    color: "inherit",
                    fontSize: "14px",
                  }}
                />
              </div>

              <input
                type="password"
                maxLength={8}
                placeholder="Enter New 4-8 Digit PIN"
                value={resetNewPin}
                onChange={(e) => setResetNewPin(e.target.value.replace(/\D/g, ""))}
                style={{
                  background: dark ? "#27272a" : "#f4f4f5",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "inherit",
                  fontSize: "15px",
                  textAlign: "center",
                  letterSpacing: "4px",
                }}
              />

              {recoveryError && (
                <small style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>
                  {recoveryError}
                </small>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoveryInput("");
                    setResetNewPin("");
                    setRecoveryError("");
                  }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid #3f3f46",
                    color: "inherit",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleRecoverPin}
                  style={{
                    flex: 1,
                    background: "#22c55e",
                    border: "none",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Reset PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secret Vault Overlay */}
      {vaultOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(14px)",
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
              <small style={{ color: "#a1a1aa" }}>Stored privately on your device</small>
            </div>

            <button
              onClick={() => {
                closePreview();
                setVaultOpen(false);
              }}
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

          {/* Real File Thumbnails */}
          {vaultFiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#71717a" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📁</div>
              <p style={{ margin: 0, fontWeight: "500" }}>Your Vault is empty.</p>
              <small>Click above to hide confidential photos, videos, or files.</small>
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
                  <VaultThumbnail file={file} onClick={() => openPreview(file)} />

                  <div style={{ padding: "8px", fontSize: "11px", background: "rgba(0,0,0,0.4)" }}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: "500",
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </div>

                    <div
                      style={{
                        color: "#71717a",
                        marginTop: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {(file.size / (1024 * 1024)).toFixed(1) === "0.0"
                          ? `${(file.size / 1024).toFixed(0)} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVaultFile(file.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "2px 4px",
                          fontSize: "12px",
                          fontWeight: "600",
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

          {/* Full Screen File Preview */}
          {previewFile && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.96)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                padding: "20px",
              }}
            >
              <button
                onClick={closePreview}
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

              {previewFile.file.type.startsWith("image/") ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.file.name}
                  style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px", objectFit: "contain" }}
                />
              ) : previewFile.file.type.startsWith("video/") ? (
                <video
                  src={previewFile.url}
                  controls
                  autoPlay
                  style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: "60px", marginBottom: "16px" }}>📄</div>
                  <p>{previewFile.file.name}</p>
                  <a
                    href={previewFile.url}
                    download={previewFile.file.name}
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

      {/* Bottom Navigation */}
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
