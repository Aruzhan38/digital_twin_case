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

export default function HealthFactors({ explanation, factors, reasons }) {
  const visibleFactors = Array.isArray(factors) ? factors.slice(0, 4) : [];
  const visibleReasons = Array.isArray(reasons) ? reasons.slice(0, 3) : [];

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>ПОЧЕМУ УХУДШЕНИЕ</h2>
      {explanation ? <p style={styles.explanation}>{explanation}</p> : null}

      {visibleFactors.length > 0 ? (
        <>
          <p style={styles.sectionLabel}>КЛЮЧЕВЫЕ ФАКТОРЫ</p>
          <ul style={styles.list}>
          {visibleFactors.map((factor) => (
            <li key={`${factor.name}-${factor.impact}`} style={styles.listItem}>
              <span style={styles.name}>{FACTOR_LABELS[factor.name] || factor.name}</span>
              <strong style={styles.impact}>{factor.impact}</strong>
            </li>
          ))}
          </ul>
        </>
      ) : (
        <p style={styles.emptyText}>Отклонений нет</p>
      )}

      {visibleReasons.length > 0 ? (
        <div style={styles.reasonBlock}>
          <p style={styles.sectionLabel}>ПРИЧИНЫ</p>
          <ul style={styles.reasonList}>
            {visibleReasons.map((reason) => (
              <li key={reason} style={styles.reasonItem}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

const styles = {
  card: {
    minHeight: 0,
    height: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    margin: 0,
    fontSize: "0.86rem",
    letterSpacing: "0.1em",
    color: "#e2e8f0",
  },
  explanation: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.82rem",
    lineHeight: 1.45,
  },
  sectionLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
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
    color: "#f87171",
    fontWeight: 800,
    fontSize: "0.9rem",
  },
  reasonBlock: {
    display: "grid",
    gap: "8px",
  },
  reasonList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: "6px",
  },
  reasonItem: {
    color: "#cbd5e1",
    fontSize: "0.8rem",
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "rgba(15, 23, 42, 0.52)",
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
};
