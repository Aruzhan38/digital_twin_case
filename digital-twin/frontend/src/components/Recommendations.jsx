export default function Recommendations({ recommendations }) {
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Recommendations</h2>
      {hasRecommendations ? (
        <ul style={styles.list}>
          {recommendations.map((recommendation) => (
            <li key={recommendation} style={styles.listItem}>
              <span style={styles.arrow}>-&gt;</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyText}>No recommendations</p>
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
    color: "#1f2937",
    fontWeight: 500,
  },
  arrow: {
    color: "#2563eb",
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    color: "#52606d",
  },
};
