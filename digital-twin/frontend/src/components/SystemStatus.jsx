import React from "react";

const STATUS_CONFIG = {
  critical: {
    icon: "🔴",
    color: "#b91c1c",
    background: "#fee2e2",
  },
  warning: {
    icon: "🟡",
    color: "#b45309",
    background: "#fef3c7",
  },
  normal: {
    icon: "🟢",
    color: "#15803d",
    background: "#dcfce7",
  },
};

export default function SystemStatus({ systemStatus }) {
  const statusMap = systemStatus || {};
  const items = [
    { key: "engine", label: "Engine" },
    { key: "fuel", label: "Fuel" },
    { key: "speed", label: "Speed" },
  ];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>SYSTEM STATUS</h2>
      <div style={styles.list}>
        {items.map(({ key, label }) => {
          const entry = statusMap[key] || { status: "normal", message: "Normal" };
          const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.normal;

          return (
            <div
              key={key}
              style={{
                ...styles.item,
                backgroundColor: config.background,
              }}
            >
              <div style={styles.labelWrap}>
                <span style={styles.icon}>{config.icon}</span>
                <span style={styles.label}>{label}</span>
              </div>
              <span style={{ ...styles.message, color: config.color }}>
                {entry.message}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "960px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: "0 0 14px",
    fontSize: "1.2rem",
    letterSpacing: "0.04em",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  item: {
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
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
    color: "#1f2937",
  },
  message: {
    fontWeight: 600,
  },
};
