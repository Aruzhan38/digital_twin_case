import React from "react";

function getHealthColor(health) {
  if (health >= 80) {
    return "#22c55e";
  }

  if (health >= 50) {
    return "#f59e0b";
  }

  return "#ef4444";
}

function getHealthLabel(status) {
  if (status === "Критично" || status === "Внимание" || status === "Норма") {
    return status;
  }

  if (status === "critical") {
    return "КРИТИЧНО";
  }

  if (status === "warning") {
    return "ВНИМАНИЕ";
  }

  return "Норма";
}

export default function HealthIndex({ health, status }) {
  if (health === null || health === undefined) {
    return (
      <section style={styles.container}>
        <p style={styles.label}>ИНДЕКС ЗДОРОВЬЯ</p>
        <p style={styles.loading}>ОЖИДАНИЕ ДАННЫХ</p>
      </section>
    );
  }

  const healthColor = getHealthColor(health);

  return (
    <section style={styles.container}>
      <p style={styles.label}>ИНДЕКС ЗДОРОВЬЯ</p>
      <div style={{ ...styles.value, color: healthColor }}>{health}%</div>
      <p style={{ ...styles.status, color: healthColor, borderColor: `${healthColor}66` }}>
        {getHealthLabel(status)}
      </p>
    </section>
  );
}

const styles = {
  container: {
    height: "100%",
    minHeight: 0,
    width: "100%",
    margin: "0 auto",
    padding: "24px 24px 20px",
    borderRadius: "18px",
    background:
      "radial-gradient(circle at top, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 58%, rgba(8, 12, 22, 1) 100%)",
    border: "1px solid rgba(59, 130, 246, 0.18)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 24px 54px rgba(2, 6, 23, 0.42)",
    textAlign: "center",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "8px",
  },
  label: {
    margin: 0,
    fontSize: "0.84rem",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    color: "#94a3b8",
  },
  value: {
    margin: "6px 0",
    fontSize: "4rem",
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textShadow: "0 0 24px rgba(255, 255, 255, 0.08)",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "180px",
    margin: 0,
    padding: "12px 18px",
    borderRadius: "999px",
    border: "1px solid",
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  loading: {
    margin: "18px 0 0",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#cbd5e1",
  },
};
