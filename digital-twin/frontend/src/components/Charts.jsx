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
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
    overflow: "hidden",
    boxSizing: "border-box",
  },
  sectionHeader: {
    marginBottom: "8px",
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
    overflow: "hidden",
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
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    margin: "0 0 6px",
    fontSize: "0.82rem",
    letterSpacing: "0.08em",
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chartWrap: {
    width: "100%",
    minHeight: 0,
    height: "200px",
    maxHeight: "200px",
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
