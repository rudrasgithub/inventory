import "../css/AddProduct.css";

export default function AddProduct({ onClose, setRenderComponent, setAddProductModalOpen }) {

  const handleCloseModal = () => {
    setRenderComponent(null); // Close CSVModal if open
    if (typeof onClose === 'function') onClose();
  };

  const handleIndividualProduct = () => {
    setRenderComponent("IndividualProduct"); // Set the component to render
    onClose();
  };

  const handleMultipleProduct = () => {
    setRenderComponent("MultipleProduct");
    // Don't close the AddProduct modal here, let the CSVModal handle it
  };

  return (
    <div className="modal-overlay-add-product" onClick={handleCloseModal}>
      <div className="modal-content-add-product" onClick={(e) => e.stopPropagation()}>
        <div className="button-group-add-product">
          <button className="btn-add-product" onClick={() => {
            handleIndividualProduct();
          }}>
            Individual Product
          </button>
          <button className="btn-add-product" onClick={handleMultipleProduct}>
            Multiple Product
          </button>
        </div>
      </div>
    </div>
  );
}
