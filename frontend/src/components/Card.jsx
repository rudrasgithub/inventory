export default function Card({ title, children, className = "" }) {
  return (
    <div className={`home-card ${className}`}>
      <div className="home-card-header">
        <h2 className="home-card-title">{title}</h2>
      </div>
      <div className="home-card-body">{children}</div>
    </div>
  );
}
