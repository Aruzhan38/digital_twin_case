import React from "react";

const SECTION_CONFIG = {
  critical: {
    label: "КРИТИЧНО",
    accent: "#ef4444",
    background: "rgba(127, 29, 29, 0.42)",
    icon: "!",
  },
  warning: {
    label: "ВНИМАНИЕ",
    accent: "#f59e0b",
    background: "rgba(120, 53, 15, 0.38)",
    icon: "!",
  },
  normal: {
    label: "НОРМА",
    accent: "#22c55e",
    background: "rgba(20, 83, 45, 0.36)",
    icon: "OK",
  },
};

export default function Alerts({ alertGroups }) {
  const groups = alertGroups || {};
  const criticalAlerts = groups.critical || [];
  const warningAlerts = groups.warning || [];
  const normalAlerts = groups.normal || [];
  const hasAlerts =
    criticalAlerts.length > 0 || warningAlerts.length > 0 || normalAlerts.length > 0;

  return (
    <section style={{ ...styles.card, ...(criticalAlerts.length > 0 ? styles.criticalCard : null) }}>
      <h2 style={styles.title}>АЛЕРТЫ</h2>
      {hasAlerts ? (
        <div style={styles.groupStack}>
          {renderGroup("critical", criticalAlerts)}
          {renderGroup("warning", warningAlerts)}
          {renderGroup("normal", normalAlerts)}
        </div>
      ) : (
        <p style={styles.emptyText}>Система в норме</p>
      )}
    </section>
  );
}

function renderGroup(severity, items) {
  if (!items || items.length === 0) {
    return null;
  }

  const config = SECTION_CONFIG[severity];

  return (
    <div
      key={severity}
      style={{
        ...styles.group,
        borderLeft: `5px solid ${config.accent}`,
        backgroundColor: config.background,
      }}
    >
      <p style={{ ...styles.groupTitle, color: config.accent }}>{config.label}</p>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={`${severity}-${item}`} style={styles.listItem}>
            <span style={{ ...styles.icon, backgroundColor: config.accent }}>{config.icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: {
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "18px",
    borderRadius: "20px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 16px 40px rgba(2, 6, 23, 0.32)",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  criticalCard: {
    boxShadow: "0 20px 44px rgba(127, 29, 29, 0.28)",
  },
  title: {
    margin: "0 0 14px",
    fontSize: "1.05rem",
    letterSpacing: "0.14em",
    color: "#f8fafc",
  },
  groupStack: {
    display: "grid",
    gap: "10px",
    minHeight: 0,
    overflow: "hidden",
  },
  group: {
    padding: "10px 12px",
    borderRadius: "14px",
    overflow: "hidden",
  },
  groupTitle: {
    margin: "0 0 10px",
    fontSize: "0.86rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: "8px",
    minHeight: 0,
    overflow: "hidden",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    color: "#e2e8f0",
    fontWeight: 600,
    minWidth: 0,
    overflow: "hidden",
  },
  icon: {
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "0.72rem",
  },
  emptyText: {
    margin: 0,
    color: "#22c55e",
    fontWeight: 700,
  },
};
