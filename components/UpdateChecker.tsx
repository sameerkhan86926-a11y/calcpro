"use client";

import { useEffect, useState } from "react";

// Jo APK phone me chal raha hai, uska version yahan set hota hai
const CURRENT_APP_VERSION = "1.0.1"; 

// Aapka live GitHub Pages version URL
const LIVE_VERSION_URL = "https://sameerkhan86926-a11y.github.io/calcpro/version.json";

type VersionInfo = {
  version: string;
  downloadUrl: string;
  whatsNew?: string;
};

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState<VersionInfo | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // ?t= lagane se phone purani cached file nahi lega, hamesha fresh data uthayega
        const res = await fetch(`${LIVE_VERSION_URL}?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data: VersionInfo = await res.json();

        // Agar server ka version current version se alag hai toh update popup dikhao
        if (data.version && data.version !== CURRENT_APP_VERSION) {
          setUpdateAvailable(data);
        }
      } catch (err) {
        console.error("Update check failed:", err);
      }
    };

    checkForUpdates();
  }, []);

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(400px, calc(100% - 32px))",
        background: "#1e1b4b",
        border: "1px solid #38bdf8",
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: "14px", color: "#38bdf8" }}>
          🚀 New Update Available (v{updateAvailable.version})
        </strong>
        <button
          onClick={() => setUpdateAvailable(null)}
          style={{
            background: "transparent",
            border: "none",
            color: "#a1a1aa",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>
        {updateAvailable.whatsNew || "A new version with performance improvements is ready."}
      </p>

      <a
        href={updateAvailable.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "4px",
          background: "#2563eb",
          color: "#ffffff",
          textAlign: "center",
          padding: "8px 12px",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        Download & Update Now
      </a>
    </div>
  );
}
