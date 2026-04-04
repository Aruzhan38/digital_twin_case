import React, { useState } from "react";

const EXPORT_URL = "http://127.0.0.1:8000/export";

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
      setMessage("Report downloaded");
    } catch (error) {
      console.error("Export failed:", error);
      setMessage("Export unavailable");
    }
  }

  return (
    <div style={styles.wrap}>
      <button onClick={handleExport} style={styles.button}>
        📥 Export Report (CSV)
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
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    margin: 0,
    color: "#52606d",
    fontSize: "0.9rem",
  },
};
