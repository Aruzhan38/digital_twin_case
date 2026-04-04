import Alerts from "./Alerts.jsx";
import Charts from "./Charts.jsx";
import HealthIndex from "./HealthIndex.jsx";

function renderList(items, emptyMessage, prefix) {
  if (!items || items.length === 0) {
    return <li>{emptyMessage}</li>;
  }

  return items.map((item) => (
    <li key={item}>
      {prefix} {item}
    </li>
  ));
}

export default function Dashboard({ data, history }) {
  if (!data) {
    return (
      <section style={styles.emptyState}>
        <h1 style={styles.title}>Digital Twin Dashboard</h1>
        <p style={styles.emptyText}>Waiting for data...</p>
      </section>
    );
  }

  const {
    health,
    status,
    speed,
    engine_temp: engineTemp,
    fuel_level: fuelLevel,
    rpm,
    reasons,
    recommendations,
  } = data;

  return (
    <section style={styles.page}>
      <h1 style={styles.title}>Digital Twin Dashboard</h1>
      <HealthIndex health={health} status={status} />

      <div style={styles.telemetryGrid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Speed</p>
          <p style={styles.metricValue}>{speed}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Engine Temp</p>
          <p style={styles.metricValue}>{engineTemp}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Fuel Level</p>
          <p style={styles.metricValue}>{fuelLevel}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>RPM</p>
          <p style={styles.metricValue}>{rpm}</p>
        </div>
      </div>

      <Charts data={history} />

      <div style={styles.infoGrid}>
        <Alerts reasons={reasons} />
        <div style={styles.infoCard}>
          <h2 style={styles.infoTitle}>Recommendations</h2>
          <ul style={styles.list}>
            {renderList(recommendations, "No actions needed", "->")}
          </ul>
        </div>
      </div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "linear-gradient(180deg, #f5f7fa 0%, #e4ecf3 100%)",
    color: "#1a202c",
    fontFamily: '"Segoe UI", sans-serif',
  },
  emptyState: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "linear-gradient(180deg, #f5f7fa 0%, #e4ecf3 100%)",
    color: "#1a202c",
    fontFamily: '"Segoe UI", sans-serif',
    padding: "24px",
  },
  title: {
    margin: "0 0 24px",
    textAlign: "center",
    fontSize: "2rem",
  },
  emptyText: {
    margin: 0,
    fontSize: "1.1rem",
  },
  telemetryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
    maxWidth: "960px",
    marginInline: "auto",
  },
  metricCard: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },
  metricLabel: {
    margin: "0 0 8px",
    color: "#4a5568",
    fontSize: "0.95rem",
  },
  metricValue: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 600,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  infoCard: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  infoTitle: {
    margin: "0 0 12px",
    fontSize: "1.2rem",
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    display: "grid",
    gap: "8px",
  },
};
