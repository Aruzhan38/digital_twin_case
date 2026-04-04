import React from "react";

function getHealthColor(health) {
  if (health >= 80) {
    return "#1f9d55";
  }

  if (health >= 50) {
    return "#d69e2e";
  }

  return "#e53e3e";
}

export default function HealthIndex({ health, status }) {
  if (health === null || health === undefined) {
    return (
      <section style={styles.container}>
        <p style={styles.label}>Health Index</p>
        <p style={styles.loading}>Loading...</p>
      </section>
    );
  }

  const healthColor = getHealthColor(health);

  return (
    <section style={styles.container}>
      <p style={styles.label}>Health Index</p>
      <div style={{ ...styles.value, color: healthColor }}>{health}</div>
      {status ? (
        <p style={{ ...styles.status, backgroundColor: healthColor }}>{status}</p>
      ) : null}
    </section>
  );
}

const styles = {
  container: {
    maxWidth: "560px",
    margin: "0 auto 24px",
    padding: "28px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    textAlign: "center",
  },
  label: {
    margin: 0,
    fontSize: "0.95rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#4a5568",
  },
  value: {
    margin: "12px 0",
    fontSize: "5rem",
    fontWeight: 700,
    lineHeight: 1,
  },
  status: {
    display: "inline-block",
    margin: 0,
    padding: "8px 16px",
    borderRadius: "999px",
    color: "#ffffff",
    textTransform: "capitalize",
    fontWeight: 600,
  },
  loading: {
    margin: "12px 0 0",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#4a5568",
  },
};
