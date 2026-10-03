"use client";

import { useEffect, useState } from "react";

// Jo purana APK installed hai uska version (nayi build banate waqt isse compare hoga)
const CURRENT_APP_VERSION = "1.0.0"; 

// Raw GitHub link (0 second cache delay, 100% reliable)
const LIVE_VERSION_URL =
  "https://raw.githubusercontent.com/sameerkhan86926-a11y/calcpro/main/public/version.json";

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
        const res = await fetch(`${LIVE_VERSION_URL}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!res.ok) return;

        const data: VersionInfo = await res.json();

        // Version check logic
        if (data.version && data.version.trim() !== CURRENT_APP_VERSION.trim()) {
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
        top: "max(14px, env(safe-area-inset-top))",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(400px, calc(100% - 32px))",
        background: "#0f172a",
        border: "1.5px solid #38bdf8",
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
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
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "#a1a1aa",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            fontSize: "14px",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          ✕
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>
        {updateAvailable.whatsNew || "A new version with performance improvements is ready."}
      </p>

      <a
        href={updateAvailable.downloadUrl}
        target="_system"
        rel="noopener noreferrer"
        style={{
          marginTop: "4px",
          background: "linear-gradient(135deg, #0284c7, #2563eb)",
          color: "#ffffff",
          textAlign: "center",
          padding: "9px 14px",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        Download & Update Now
      </a>
    </div>
  );
}
