import React from "react";

export default function SystemMetrics({ eventsPerSecond, latencyMs }) {
  return (
    <section style={styles.card}>
      <div style={styles.metric}>
        <span style={styles.label}>ЗАДЕРЖКА</span>
        <strong style={styles.value}>{latencyMs} ms</strong>
      </div>
      <div style={styles.metric}>
        <span style={styles.label}>СОБЫТИЙ/СЕК</span>
        <strong style={styles.value}>{eventsPerSecond}</strong>
      </div>
    </section>
  );
}

const styles = {
  card: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
    minWidth: "220px",
    padding: "8px 10px",
    borderRadius: "14px",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    boxSizing: "border-box",
  },
  metric: {
    display: "grid",
    gap: "4px",
  },
  label: {
    color: "#94a3b8",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
    whiteSpace: "nowrap",
  },
  value: {
    color: "#f8fafc",
    fontSize: "0.92rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
};
