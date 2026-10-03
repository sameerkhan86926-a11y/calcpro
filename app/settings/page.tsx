"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [numFormat, setNumFormat] = useState("en-IN");
  const [vibration, setVibration] = useState(true);
  const [modalType, setModalType] = useState<"about" | "privacy" | null>(null);
  const [clearedMessage, setClearedMessage] = useState(false);

  useEffect(() => {
    const savedDark = localStorage.getItem("calcpro-theme");
    if (savedDark !== null) setDark(savedDark === "dark");

    const savedFormat = localStorage.getItem("calcpro-format");
    if (savedFormat) setNumFormat(savedFormat);

    const savedVibe = localStorage.getItem("calcpro-vibration");
    if (savedVibe !== null) setVibration(savedVibe === "true");
  }, []);

  const toggleTheme = (val: boolean) => {
    setDark(val);
    localStorage.setItem("calcpro-theme", val ? "dark" : "light");
  };

  const handleFormatChange = (format: string) => {
    setNumFormat(format);
    localStorage.setItem("calcpro-format", format);
  };

  const toggleVibration = () => {
    const nextVal = !vibration;
    setVibration(nextVal);
    localStorage.setItem("calcpro-vibration", String(nextVal));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all calculation history?")) {
      localStorage.removeItem("calcpro-history");
      setClearedMessage(true);
      setTimeout(() => setClearedMessage(false), 2500);
    }
  };

  return (
    <main className={`app ${dark ? "dark" : "light"} settings-page`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"></div>
          <div>
            <h1>Settings</h1>
            <p>CalcPro Preferences</p>
          </div>
        </div>

        <Link href="/" className="back-button">
          Done
        </Link>
      </header>

      <section className="settings-container">
        {/* Appearance Group */}
        <div className="settings-group">
          <span className="settings-group-title">APPEARANCE</span>
          
          <div className="settings-row">
            <div>
              <strong>Theme</strong>
              <p>Choose dark or light visual style</p>
            </div>
            <div className="toggle-switch">
              <button
                className={dark ? "pill-btn active" : "pill-btn"}
                onClick={() => toggleTheme(true)}
              >
                Dark
              </button>
              <button
                className={!dark ? "pill-btn active" : "pill-btn"}
                onClick={() => toggleTheme(false)}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Calculation & Region Group */}
        <div className="settings-group">
          <span className="settings-group-title">CALCULATION PREFERENCES</span>

          <div className="settings-row">
            <div>
              <strong>Number Format</strong>
              <p>Display grouping style</p>
            </div>
            <select
              value={numFormat}
              onChange={(e) => handleFormatChange(e.target.value)}
              className="settings-select"
            >
              <option value="en-IN">Indian (1,00,000)</option>
              <option value="en-US">Western (100,000)</option>
            </select>
          </div>

          <div className="settings-row">
            <div>
              <strong>Keypad Feedback</strong>
              <p>Vibration on button tap</p>
            </div>
            <button
              onClick={toggleVibration}
              className={`pill-btn ${vibration ? "active" : ""}`}
            >
              {vibration ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="settings-group">
          <span className="settings-group-title">DATA & STORAGE</span>

          <div className="settings-row">
            <div>
              <strong>Calculation History</strong>
              <p>Wipe all stored calculations</p>
            </div>
            <button onClick={handleClearHistory} className="danger-btn">
              {clearedMessage ? "Cleared ✓" : "Clear All"}
            </button>
          </div>
        </div>

        {/* Info & Legal */}
        <div className="settings-group">
          <span className="settings-group-title">ABOUT & LEGAL</span>

          <button
            className="settings-link-row"
            onClick={() => setModalType("about")}
          >
            <span>About CalcPro</span>
            <span className="tool-arrow">→</span>
          </button>

          <button
            className="settings-link-row"
            onClick={() => setModalType("privacy")}
          >
            <span>Privacy Policy</span>
            <span className="tool-arrow">→</span>
          </button>
        </div>
      </section>

      {/* Modal / Dialog */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === "about" ? (
              <>
                <h3>CalcPro</h3>
                <p className="modal-version">Version 1.0.0 (Pro Edition)</p>
                <p>
                  A modern, high-precision smart calculator and financial utility app built for fast everyday and business calculations.
                </p>
              </>
            ) : (
              <>
                <h3>Privacy Policy</h3>
                <p>
                  CalcPro stores all your calculations, preferences, and history locally on your device using browser storage. No personal data or calculation expressions are transmitted to any external server.
                </p>
              </>
            )}
            <button className="modal-close-btn" onClick={() => setModalType(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/" className="nav-item">
          <span>⌕</span>
          <small>Calculator</small>
        </Link>

        <Link href="/tools/" className="nav-item">
          <span>+</span>
          <small>Tools</small>
        </Link>

        <Link href="/#history" className="nav-item">
          <span>≡</span>
          <small>History</small>
        </Link>

        <Link href="/settings/" className="nav-item active">
          <span>⚙</span>
          <small>Settings</small>
        </Link>
      </nav>
    </main>
  );
}
