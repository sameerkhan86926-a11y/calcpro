"use client";

import { useEffect, useState } from "react";

// Current app version jo is build me hardcoded hai
const CURRENT_VERSION = "1.0.0";

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateData, setUpdateData] = useState<{
    version: string;
    downloadUrl: string;
    whatsNew: string;
  } | null>(null);

  useEffect(() => {
    async function checkForUpdate() {
      try {
        // Cache bypass karne ke liye timestamp lagaya hai
        const res = await fetch(`/calcpro/version.json?t=${Date.now()}`);
        if (!res.ok) return;

        const data = await res.json();

        // Agar server version current version se alag hai toh update popup dikhao
        if (data.version && data.version !== CURRENT_VERSION) {
          setUpdateData(data);
          setUpdateAvailable(true);
        }
      } catch (err) {
        console.error("Update check failed", err);
      }
    }

    // App open hone ke 3 second baad check karega
    const timer = setTimeout(checkForUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!updateAvailable || !updateData) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "340px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
          }}
        >
          🚀
        </div>

        <h3
          style={{
            color: "#fff",
            fontSize: "19px",
            fontWeight: "700",
            margin: "0 0 8px",
          }}
        >
          Update Available!
        </h3>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            lineHeight: "1.5",
            margin: "0 0 16px",
          }}
        >
          Version <b>v{updateData.version}</b> ready hai.
          <br />
          <span style={{ color: "#38bdf8" }}>{updateData.whatsNew}</span>
        </p>

        <a
          href={updateData.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: "linear-gradient(135deg, #0284c7, #2563eb)",
            color: "#fff",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "600",
            textDecoration: "none",
            fontSize: "15px",
            marginBottom: "10px",
          }}
        >
          Download Update
        </a>

        <button
          onClick={() => setUpdateAvailable(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "13px",
            cursor: "pointer",
            padding: "6px",
          }}
        >
          Remind Me Later
        </button>
      </div>
    </div>
  );
}
