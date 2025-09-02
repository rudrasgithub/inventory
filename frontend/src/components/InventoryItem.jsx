export default function InventoryItem({ iconColor, value, label }) {
  return (
    <div className="home-inventory-item">
      <div className={`home-metric-icon ${iconColor} small`}>
        <div className="home-icon-inner" />
      </div>
      <div>
        <div className="home-metric-value">{value}</div>
        <div className="home-metric-label">{label}</div>
      </div>
    </div>
  );
}
