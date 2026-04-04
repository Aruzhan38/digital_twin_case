import React, { useState } from "react";

const EXPORT_URL = "http://127.0.0.1:8000/export?range_minutes=5";

export default function ExportButton() {
  const [message, setMessage] = useState("");

  async function handleExport() {
    try {
      const response = await fetch(EXPORT_URL);

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.csv";
      link.click();
      window.URL.revokeObjectURL(url);
      setMessage("Отчёт выгружен");
    } catch (error) {
      console.error("Export failed:", error);
      setMessage("Выгрузка недоступна");
    }
  }

  return (
    <div style={styles.wrap}>
      <button onClick={handleExport} style={styles.button}>
        📥 ВЫГРУЗИТЬ CSV
      </button>
      {message ? <p style={styles.message}>{message}</p> : null}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
  },
  button: {
    border: "1px solid rgba(56, 189, 248, 0.35)",
    borderRadius: "12px",
    padding: "10px 14px",
    backgroundColor: "rgba(37, 99, 235, 0.18)",
    color: "#e0f2fe",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.82rem",
  },
};
