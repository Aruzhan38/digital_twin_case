import React from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TREND_WINDOW = 8;
const TREND_THRESHOLDS = {
  fuel_chart: 1.5,
  speed_chart: 2,
  temperature_chart: 1.5,
};

function formatTimestamp(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function renderTooltipValue(value, label) {
  return [`${value}`, label];
}

function getTrendDirection(values, threshold) {
  if (values.length < 2) {
    return "stable";
  }

  const delta = values[values.length - 1] - values[0];

  if (delta > threshold) {
    return "up";
  }

  if (delta < -threshold) {
    return "down";
  }

  return "stable";
}

function getTrendLabel(metric, trend) {
  if (trend === "up") {
    return {
      color:
        metric === "temperature_chart"
          ? "#ef4444"
          : "#38bdf8",
      icon: "↑",
      text: "растёт",
    };
  }

  if (trend === "down") {
    return {
      color: metric === "fuel_chart" ? "#ef4444" : "#f59e0b",
      icon: "↓",
      text: "падает",
    };
  }

  return {
    color: "#22c55e",
    icon: "→",
    text: "стабильна",
  };
}

function getTrendMeta(data, key) {
  const values = data
    .slice(-TREND_WINDOW)
    .map((point) => Number(point[key]))
    .filter((value) => Number.isFinite(value));
  const trend = getTrendDirection(values, TREND_THRESHOLDS[key] || 1);

  return getTrendLabel(key, trend);
}

function normalizeChartData(data) {
  return (Array.isArray(data) ? data : []).map((point) => ({
    ...point,
    speed_chart: point.speed_smoothed ?? point.speed ?? 0,
    temperature_chart:
      point.engine_temp_smoothed ??
      point.engine_temp ??
      point.temperature_engine ??
      0,
    fuel_chart: point.fuel_level_smoothed ?? point.fuel_level ?? 0,
  }));
}

function ChartCard({ title, dataKey, stroke, data }) {
  const trend = getTrendMeta(data, dataKey);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={{ ...styles.trendBadge, color: trend.color }}>
          {trend.icon} {trend.text}
        </p>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              minTickGap={24}
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              contentStyle={styles.tooltip}
              labelStyle={styles.tooltipLabel}
              labelFormatter={formatTimestamp}
              formatter={(value) => renderTooltipValue(value, title)}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Charts({ compact = false, data }) {
  const chartData = normalizeChartData(data);
  const summary = {
    speed: getTrendMeta(chartData, "speed_chart"),
    temperature: getTrendMeta(chartData, "temperature_chart"),
    fuel: getTrendMeta(chartData, "fuel_chart"),
  };

  if (chartData.length === 0) {
    return (
      <section style={styles.emptyCard}>
        <h2 style={styles.title}>ТРЕНДЫ</h2>
        <p style={styles.subtitle}>Последние точки телеметрии</p>
        <p style={styles.emptyText}>Нет данных</p>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.title}>ТРЕНДЫ</h2>
          <p style={styles.subtitle}>{compact ? "Последние минуты" : "Последние 5-30 минут, сглаживание EMA"}</p>
        </div>
        <div style={styles.summary}>
          <span style={{ ...styles.summaryItem, color: summary.temperature.color }}>
            Температура {summary.temperature.icon} {summary.temperature.text}
          </span>
          <span style={{ ...styles.summaryItem, color: summary.speed.color }}>
            Скорость {summary.speed.icon} {summary.speed.text}
          </span>
          <span style={{ ...styles.summaryItem, color: summary.fuel.color }}>
            Топливо {summary.fuel.icon} {summary.fuel.text}
          </span>
        </div>
      </div>
      <div style={styles.grid}>
        <ChartCard title="СКОРОСТЬ" dataKey="speed_chart" stroke="#38bdf8" data={chartData} />
        <ChartCard title="ТЕМПЕРАТУРА" dataKey="temperature_chart" stroke="#f97316" data={chartData} />
        <ChartCard title="ТОПЛИВО" dataKey="fuel_chart" stroke="#22c55e" data={chartData} />
      </div>
    </section>
  );
}

const styles = {
  section: {
    width: "100%",
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    overflow: "visible",
    boxSizing: "border-box",
  },
  sectionHeader: {
    marginBottom: "8px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    margin: "0 0 4px",
    fontSize: "1rem",
    letterSpacing: "0.1em",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    overflow: "visible",
  },
  card: {
    height: "100%",
    minHeight: 0,
    maxWidth: "100%",
    padding: "10px 12px",
    borderRadius: "14px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    boxSizing: "border-box",
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "6px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  trendBadge: {
    margin: 0,
    fontSize: "0.74rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  chartContainer: {
    width: "100%",
    height: "180px",
    minHeight: 0,
    maxHeight: "180px",
    overflow: "visible",
  },
  tooltip: {
    backgroundColor: "#0f172a",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    color: "#e2e8f0",
  },
  tooltipLabel: {
    color: "#94a3b8",
  },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 12px",
    justifyContent: "flex-end",
  },
  summaryItem: {
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  emptyCard: {
    padding: "12px",
    borderRadius: "14px",
    backgroundColor: "#172033",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    height: "100%",
    minHeight: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
  },
};
