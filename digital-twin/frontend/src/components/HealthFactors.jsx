import React from "react";

const FACTOR_LABELS = {
  alerts: "Системные сигналы",
  coolant: "Охлаждение",
  engine_temp: "Температура двигателя",
  fuel: "Топливо",
  load: "Тяговая нагрузка",
  pressure: "Давление",
  voltage: "Напряжение",
};

export default function HealthFactors({ factors }) {
  const visibleFactors = Array.isArray(factors) ? factors.slice(0, 4) : [];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>КЛЮЧЕВЫЕ ФАКТОРЫ</h2>
      {visibleFactors.length > 0 ? (
        <ul style={styles.list}>
          {visibleFactors.map((factor) => (
            <li key={`${factor.name}-${factor.impact}`} style={styles.listItem}>
              <span style={styles.name}>{FACTOR_LABELS[factor.name] || factor.name}</span>
              <strong style={styles.impact}>{factor.impact}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyText}>Отклонений нет</p>
      )}
    </section>
  );
}

const styles = {
  card: {
    minHeight: "120px",
    padding: "12px 14px",
    borderRadius: "16px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "0.86rem",
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  name: {
    color: "#cbd5e1",
    fontSize: "0.86rem",
    fontWeight: 600,
  },
  impact: {
    color: "#fb923c",
    fontWeight: 800,
    fontSize: "0.9rem",
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
};
