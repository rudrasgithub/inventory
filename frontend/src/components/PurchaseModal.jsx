import React, { useState } from 'react';
import toast from 'react-hot-toast';
import "../css/PurchaseModal.css";

const PurchaseModal = ({ product, onClose, onBuy }) => {
  const [quantityToBuy, setQuantityToBuy] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleIncrease = () => {
    if (quantityToBuy < product.quantity) {
      setQuantityToBuy(quantityToBuy + 1);
    }
  };

  const handleDecrease = () => {
    if (quantityToBuy > 1) {
      setQuantityToBuy(quantityToBuy - 1);
    }
  };

  const handleMaxQuantity = () => {
    setQuantityToBuy(product.quantity);
  };

  const handleBuy = async () => {
    if (quantityToBuy > product.quantity) {
      toast.error('Insufficient stock available!');
      return;
    }

    setIsLoading(true);
    try {
      await onBuy(product._id, quantityToBuy);
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay-buy-products" onClick={onClose}>
      <div className="modal-content-buy-products" onClick={(e) => e.stopPropagation()}>
        <h2>Buy Product</h2>
        
        {/* Product Image */}
        {product.image && (
          <div className="product-image-container">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image"
              style={{ 
                maxWidth: '200px', 
                maxHeight: '150px', 
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '15px'
              }} 
            />
          </div>
        )}
        
        <p><strong>Product Name:</strong> {product.name}</p>
        <p><strong>Price:</strong> ₹{product.price}</p>
                  <div className="quantity-controls">
            <button className="quantity-btn" onClick={handleDecrease}>-</button>
            <span className="quantity-display">{quantityToBuy}</span>
            <button className="quantity-btn" onClick={handleIncrease}>+</button>
            <button className="max-btn" onClick={handleMaxQuantity} disabled={quantityToBuy === product.quantity}>
              Max
            </button>
          </div>
        <p><strong>Available:</strong> {product.quantity}</p>
        <div className="modal-actions">
          <button 
            onClick={handleBuy} 
            className="buy-button" 
            disabled={isLoading || quantityToBuy > product.quantity}
          >
            {isLoading ? 'Processing...' : 'Buy'}
          </button>
          <button onClick={onClose} className="close-button" disabled={isLoading}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
