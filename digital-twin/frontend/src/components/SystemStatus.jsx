import React from "react";

const STATUS_CONFIG = {
  critical: {
    icon: "🔴",
    color: "#ef4444",
    background: "rgba(239, 68, 68, 0.12)",
  },
  warning: {
    icon: "🟡",
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.12)",
  },
  normal: {
    icon: "🟢",
    color: "#22c55e",
    background: "rgba(34, 197, 94, 0.12)",
  },
};

export default function SystemStatus({ systemStatus }) {
  const statusMap = systemStatus || {};
  const items = [
    { key: "engine", label: "ДВИГАТЕЛЬ" },
    { key: "fuel", label: "ТОПЛИВО" },
    { key: "speed", label: "СКОРОСТЬ" },
  ];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>СТАТУС СИСТЕМ</h2>
      <div style={styles.list}>
        {items.map(({ key, label }) => {
          const entry = statusMap[key] || { status: "normal", message: "Норма" };
          const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.normal;

          return (
            <div key={key} style={{ ...styles.item, backgroundColor: config.background }}>
              <div style={styles.labelWrap}>
                <span style={styles.icon}>{config.icon}</span>
                <span style={styles.label}>{label}</span>
              </div>
              <span style={{ ...styles.message, color: config.color }}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  card: {
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "12px",
    borderRadius: "18px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "0.88rem",
    letterSpacing: "0.08em",
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  list: {
    display: "grid",
    gap: "8px",
    minHeight: 0,
  },
  item: {
    borderRadius: "12px",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    minWidth: 0,
    overflow: "hidden",
  },
  labelWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  icon: {
    fontSize: "1rem",
    lineHeight: 1,
  },
  label: {
    fontWeight: 700,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  message: {
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
