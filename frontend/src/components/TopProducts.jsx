import React from 'react';
import "../css/TopProducts.css";

const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const TopProducts = ({
  topProducts = [],
  className = "",
  showTitle = true,
  titleText = "Top Products",
  containerStyle = {},
  isLoading = false,
}) => {

  const limitedProducts = topProducts
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const renderStars = (index) => {
    const rating = 5 - index;
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? "filled" : ""}`}>
        ●
      </span>
    ));
  };

  return (
    <div className={`top-products-component ${className}`} style={containerStyle}>
      {showTitle && (
        <div className="top-products-header">
          <h3 className="top-products-title">{titleText}</h3>
        </div>
      )}
      <div className="top-products-content">
        {isLoading ? (
          <div className="loading-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            textAlign: 'center',
            color: '#6B7280',
            minHeight: '120px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #E5E7EB',
              borderTop: '2px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '8px'
            }}></div>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Loading top products...</span>
          </div>
        ) : limitedProducts.length > 0 ? (
          limitedProducts.map((product, index) => (
            <div key={product._id || index} className="top-product-item">
              <div className="product-details">
                <span className="product-name">{product.name}</span>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image-small"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div className="product-stars">
                {renderStars(index)}
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            textAlign: 'center',
            color: '#6B7280',
            minHeight: '120px'
          }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#374151', fontSize: '16px' }}>No Top Products Available</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducts;
