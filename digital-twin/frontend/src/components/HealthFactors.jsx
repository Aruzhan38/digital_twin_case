import React from "react";

export default function HealthFactors({ factors }) {
  const visibleFactors = Array.isArray(factors) ? factors : [];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Top factors affecting health</h2>
      {visibleFactors.length > 0 ? (
        <ul style={styles.list}>
          {visibleFactors.map((factor) => (
            <li
              key={`${factor.name}-${factor.impact}`}
              style={styles.listItem}
            >
              <span>{factor.name}</span>
              <strong style={styles.impact}>{factor.impact}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyText}>No issues detected</p>
      )}
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "560px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "1.2rem",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: "10px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    color: "#1f2937",
  },
  impact: {
    color: "#dc2626",
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    color: "#52606d",
  },
};
