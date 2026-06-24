export const StatsStrip = ({ stats }) => {
  return (
    <div className="grid-bento grid-bento-3">
      {stats.map((stat) => (
        <div className="card panel" key={stat.label}>
          <div className="stat">
            <span className="muted" style={{ fontSize: "0.86rem", fontWeight: 700 }}>
              {stat.label}
            </span>
            <span className="stat-value">{stat.value}</span>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              {stat.help}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
