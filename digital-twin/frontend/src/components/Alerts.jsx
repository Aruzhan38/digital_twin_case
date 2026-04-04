import React from "react";

const SECTION_CONFIG = {
  critical: {
    label: "Critical",
    accent: "#b91c1c",
    background: "#fee2e2",
    icon: "!",
  },
  warning: {
    label: "Warning",
    accent: "#b45309",
    background: "#fef3c7",
    icon: "!",
  },
  normal: {
    label: "Normal",
    accent: "#15803d",
    background: "#dcfce7",
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
    <section
      style={{
        ...styles.card,
        ...(criticalAlerts.length > 0 ? styles.criticalCard : null),
      }}
    >
      <h2 style={styles.title}>Alerts</h2>
      {hasAlerts ? (
        <div style={styles.groupStack}>
          {renderGroup("critical", criticalAlerts)}
          {renderGroup("warning", warningAlerts)}
          {renderGroup("normal", normalAlerts)}
        </div>
      ) : (
        <p style={styles.emptyText}>System normal</p>
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
        borderLeft: `6px solid ${config.accent}`,
        backgroundColor: config.background,
      }}
    >
      <p style={{ ...styles.groupTitle, color: config.accent }}>
        {config.label.toUpperCase()}
      </p>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={`${severity}-${item}`} style={styles.listItem}>
            <span
              style={{
                ...styles.icon,
                backgroundColor: config.accent,
              }}
            >
              {config.icon}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  criticalCard: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    boxShadow: "0 16px 40px rgba(185, 28, 28, 0.14)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "1.2rem",
  },
  groupStack: {
    display: "grid",
    gap: "12px",
  },
  group: {
    padding: "14px",
    borderRadius: "12px",
  },
  groupTitle: {
    margin: "0 0 10px",
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
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
    alignItems: "center",
    gap: "10px",
    color: "#1f2937",
    fontWeight: 500,
  },
  icon: {
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.72rem",
  },
  emptyText: {
    margin: 0,
    color: "#1f9d55",
    fontWeight: 600,
  },
};
