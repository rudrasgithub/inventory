import Breadcrumb from "./Breadcrumb";
import ProductForm from "./ProductForm";
import "../css/NewProduct.css";

export default function NewProduct({ setRenderComponent, refreshProducts }) {
  return (
    <div className="np-page">
      <div className="np-main">
          <Breadcrumb />
          <ProductForm setRenderComponent={setRenderComponent} refreshProducts={refreshProducts} />
      </div>
    </div>
  );
}
