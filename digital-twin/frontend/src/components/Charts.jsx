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

function ChartCard({ title, dataKey, stroke, data }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              minTickGap={24}
              stroke="#52606d"
            />
            <YAxis stroke="#52606d" />
            <Tooltip
              labelFormatter={formatTimestamp}
              formatter={(value) => [value, title]}
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

export default function Charts({ data }) {
  if (!data || data.length === 0) {
    return (
      <section style={styles.emptyCard}>
        <h2 style={styles.title}>Telemetry Trends</h2>
        <p style={styles.emptyText}>Waiting for chart data...</p>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Telemetry Trends</h2>
      <div style={styles.grid}>
        <ChartCard title="Speed" dataKey="speed" stroke="#1d4ed8" data={data} />
        <ChartCard
          title="Engine Temp"
          dataKey="engine_temp"
          stroke="#dc2626"
          data={data}
        />
        <ChartCard
          title="Fuel Level"
          dataKey="fuel_level"
          stroke="#0f766e"
          data={data}
        />
      </div>
    </section>
  );
}

const styles = {
  section: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
  },
  title: {
    margin: "0 0 16px",
    textAlign: "center",
    fontSize: "1.4rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  cardTitle: {
    margin: "0 0 12px",
    fontSize: "1rem",
    color: "#334e68",
  },
  chartWrap: {
    width: "100%",
    height: "240px",
  },
  emptyCard: {
    maxWidth: "1100px",
    margin: "0 auto 24px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },
  emptyText: {
    margin: 0,
    color: "#52606d",
  },
};
