import "../css/Breadcrumb.css";

export default function Breadcrumb() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <span>Add Product</span>
        <img src="/chevron-right.svg" />
        <span>Individual Product</span>
      </ol>
    </nav>
  );
}
