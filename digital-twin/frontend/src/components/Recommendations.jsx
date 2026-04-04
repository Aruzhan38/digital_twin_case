import React from "react";

export default function Recommendations({ recommendations }) {
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>РЕКОМЕНДАЦИИ</h2>
      {hasRecommendations ? (
        <ul style={styles.list}>
          {recommendations.map((recommendation) => (
            <li key={recommendation} style={styles.listItem}>
              <span style={styles.icon}>🔧</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyText}>Система работает нормально</p>
      )}
    </section>
  );
}

const styles = {
  card: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 27, 0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 18px 40px rgba(2, 6, 23, 0.32)",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "0.88rem",
    letterSpacing: "0.1em",
    color: "#e2e8f0",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: "8px",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    color: "#cbd5e1",
    fontWeight: 500,
    fontSize: "0.84rem",
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  icon: {
    minWidth: "18px",
    lineHeight: 1,
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
  },
};
