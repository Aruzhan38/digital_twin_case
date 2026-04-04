import React from "react";

const STATUS_CONFIG = {
  connected: {
    icon: "🟢",
    label: "Connected",
    color: "#15803d",
    background: "#dcfce7",
  },
  connecting: {
    icon: "🟡",
    label: "Connecting",
    color: "#b45309",
    background: "#fef3c7",
  },
  disconnected: {
    icon: "🔴",
    label: "Disconnected",
    color: "#b91c1c",
    background: "#fee2e2",
  },
};

export default function ConnectionStatus({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.connecting;

  return (
    <div
      style={{
        ...styles.badge,
        color: config.color,
        backgroundColor: config.background,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

const styles = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
};
