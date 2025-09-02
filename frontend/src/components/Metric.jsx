export default function Metric({ iconColor, value, label }) {
  return (
    <div className="home-metric">
      <div className={`home-metric-icon ${iconColor}`}>
        <div className="home-icon-inner" />
      </div>
      <div className="home-metric-text">
        <div className="home-metric-value">{value}</div>
        <div className="home-metric-label">{label}</div>
      </div>
    </div>
  );
}
