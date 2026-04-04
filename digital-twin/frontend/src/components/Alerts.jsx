export default function Alerts({ reasons }) {
  const hasAlerts = reasons && reasons.length > 0;

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Alerts</h2>
      {hasAlerts ? (
        <ul style={styles.list}>
          {reasons.map((reason) => (
            <li key={reason} style={styles.listItem}>
              <span style={styles.icon}>!</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyText}>System normal</p>
      )}
    </section>
  );
}

const styles = {
  card: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "1.2rem",
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
    color: "#7c2d12",
    fontWeight: 500,
  },
  icon: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    color: "#1f9d55",
    fontWeight: 600,
  },
};
