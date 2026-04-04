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
    maxWidth: "520px",
    margin: "0 auto",
    padding: "18px 22px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 24px 60px rgba(2, 6, 23, 0.45)",
    textAlign: "center",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  label: {
    margin: 0,
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#94a3b8",
  },
  value: {
    margin: "10px 0 8px",
    fontSize: "4.3rem",
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "160px",
    margin: 0,
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
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
