import React from "react";

const STATUS_CONFIG = {
  connected: {
    icon: "🟢",
    label: "СВЯЗЬ ЕСТЬ",
    color: "#22c55e",
    background: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.35)",
  },
  connecting: {
    icon: "🟡",
    label: "ПОДКЛЮЧЕНИЕ",
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  disconnected: {
    icon: "🔴",
    label: "НЕТ СВЯЗИ",
    color: "#ef4444",
    background: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
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
        borderColor: config.border,
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
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid",
    fontWeight: 700,
    fontSize: "0.85rem",
    letterSpacing: "0.04em",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(8px)",
  },
};
