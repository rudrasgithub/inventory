import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/ContextProvider';
import toast, { Toaster } from 'react-hot-toast';
import "../css/Product.css";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import AddProduct from "./AddProduct";
import NewProduct from "./NewProduct";
import IndividualProduct from "./NewProduct";
import MultipleProduct from "./CSVModal";
import PurchaseModal from "./PurchaseModal";

export default function Product() {
  const { token, isInitialized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);  // Initialize as false to prevent SSR issues
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [renderComponent, setRenderComponent] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Make pagination configurable
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [summary, setSummary] = useState({
    categories: 0,
    totalProducts: 0,
    revenue: 0,
    notInStock: 0, // Count of products with quantity === 0 (current stock)
    ordered: 0,    // Total products bought (sum of purchase quantities)
  });
  const [isBuyModalOpen, setBuyModalOpen] = useState(false);
  const [productToBuy, setProductToBuy] = useState(null);
  const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  
  // Invoice overview state for mobile
  const [invoiceStats, setInvoiceStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0
  });
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '0';
    return Number(value).toLocaleString();
  };

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSummary = async () => {
    if (!token) {
      console.log('No token available, skipping summary fetch');
      return;
    }

    console.log('[fetchSummary] calling');
    try {
      const url = `${backendUrl}/api/products/summary`;
      console.log('[fetchSummary] GET', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[fetchSummary] Error response:', response.status, errorText);
        throw new Error('Failed to fetch summary');
      }
      const data = await response.json();
      console.log('[fetchSummary] data', data);
      setSummary({
        categories: data.categories,
        totalProducts: data.totalProducts, // cumulative quantity added at creation time
        revenue: data.revenue,             // total revenue from purchases
        notInStock: data.notInStock || 0,
        ordered: data.ordered || 0,        // total purchased product items (all time)
      });
    } catch (error) {
      console.error('[fetchSummary] exception:', error);
    }
  };

  // Fetch invoice stats for mobile overview
  const fetchInvoiceStats = async () => {
    if (!token) {
      console.log('No token available, skipping invoice stats fetch');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/invoices/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Invoice stats API response:', data);
        
        const totalPaidAmount = Number(data.paidAmount?.last7Days) || 0;
        const totalUnpaidAmount = Number(data.unpaidAmount?.ordered) || 0;
        
        const stats = {
          totalInvoices: Number(data.totalInvoices?.processed) || 0,
          totalAmount: totalPaidAmount + totalUnpaidAmount,
          paidAmount: totalPaidAmount,
          dueAmount: totalUnpaidAmount
        };
        
        console.log('Setting invoice stats:', stats);
        setInvoiceStats(stats);
      } else {
        console.log('Invoice stats API returned non-OK response:', response.status);
        // Keep default values if API fails
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      // Keep default values if fetch fails
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        console.log('No token available, skipping product fetch');
        return;
      }

      setLoading(true);
      try {
        const searchParam = debouncedSearchQuery ? `&search=${encodeURIComponent(debouncedSearchQuery)}` : '';
        const response = await fetch(`${backendUrl}/api/products/paginated?page=${currentPage}&limit=${itemsPerPage}${searchParam}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    if (token && isInitialized) {
      fetchProducts();
      fetchSummary();
      fetchInvoiceStats();
    }
  }, [token, isInitialized, currentPage, backendUrl, debouncedSearchQuery, itemsPerPage]);

  // Periodic refresh to catch status changes from cron jobs (every 5 minutes)
  useEffect(() => {
    if (!token || !isInitialized) return;

    const interval = setInterval(() => {
      console.log('Periodic refresh: checking for product status updates from backend');
      refreshProducts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, isInitialized]);

  const refreshProducts = async (isNewProduct = false) => {
    if (!token) {
      console.log('No token available, skipping product refresh');
      return;
    }

    try {
      const pageToFetch = isNewProduct && currentPage === totalPages ? totalPages : currentPage;
      const searchParam = debouncedSearchQuery ? `&search=${encodeURIComponent(debouncedSearchQuery)}` : '';
      const response = await fetch(`${backendUrl}/api/products/paginated?page=${pageToFetch}&limit=${itemsPerPage}${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token invalid during refresh, user may need to re-login');
          toast.error('Session expired. Please login again.');
          return;
        }
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);

      if (isNewProduct) {
        await fetchSummary();
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error("Failed to refresh products");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const openAddProductModal = () => {
    setAddProductModalOpen(true);
  };

  const closeAddProductModal = () => {
    setAddProductModalOpen(false);
  };

  const getStatusClass = (quantity, threshold, status) => {
    // Prioritize backend status over calculated status
    if (status === "Expired") {
      return "status expired";
    } else if (status === "Out of stock" || quantity === 0) {
      return "status out-stock";
    } else if (quantity > threshold) {
      return "status in-stock";
    } else {
      return "status low-stock";
    }
  };

  const getStatusText = (quantity, threshold, status) => {
    // Prioritize backend status over calculated status
    if (status === "Expired") {
      return "Expired";
    } else if (status === "Out of stock" || quantity === 0) {
      return "Out of stock";
    } else if (quantity > threshold) {
      return "In-stock";
    } else {
      return "Low stock";
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleRowClick = (product) => {
    // Prevent purchasing expired or out-of-stock products
    if (product.status === 'Expired' || product.quantity === 0) {
      toast.error(`Cannot purchase ${product.status === 'Expired' ? 'expired' : 'out-of-stock'} product`);
      return;
    }

    setProductToBuy(product);
    setBuyModalOpen(true);
  };

  const handleBuy = async (productId, quantity) => {
    try {
      const response = await fetch(`${backendUrl}/api/products/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle token expiration or invalid token
        if (response.status === 401 && (errorData.message.includes('Token is not valid') || errorData.message.includes('authorization denied'))) {
          toast.error('Session expired. Please login again.');
          // Clear invalid token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }

        toast.error(errorData.message || "Failed to buy product");
        throw new Error(errorData.message || "Failed to buy product");
      }

      const data = await response.json();
      console.log("Purchase successful:", data);

      toast.success(`Successfully purchased ${quantity} item(s)!`);

      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product._id === productId) {
            const updatedQuantity = product.quantity - quantity;
            // Let the backend determine the status based on expiry and quantity
            // We'll just update the quantity and the next refresh will get the correct status
            return {
              ...product,
              quantity: updatedQuantity,
              // Don't override the status here - let the backend manage it
            };
          }
          return product;
        })
      );

      setBuyModalOpen(false);

      await fetchSummary();
      await refreshProducts();
    } catch (error) {
      console.error("Error buying product:", error);
      throw error;
    }
  };

  const handleInfoClick = (e, product) => {
    e.stopPropagation(); // Prevent row click
    setSelectedProductInfo(product);
    setIsProductInfoModalOpen(true);
  };

  const closeProductInfoModal = () => {
    setIsProductInfoModalOpen(false);
    setSelectedProductInfo(null);
  };

  return (
    <div className="dashboard">
      {!isMobile && <Sidebar />}

      <div className={`main-product ${(isAddProductModalOpen || renderComponent === "MultipleProduct" || (isMobile && isProductInfoModalOpen)) ? "blur" : ""}`}>
        {/* Desktop header */}
        {!isMobile && (
          <header className="product-header">
            <h1>Product</h1>
            <div className="search-box-product">
              <img src="/search-icon.svg" className="search-icon-product" />
              <input
                className="search-box-input-product"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                title="Search across all fields: name, ID, category, price, quantity, threshold, status, unit"
              />
            </div>
          </header>
        )}

        {isMobile && (
          <header className="mobile-header">
            <div className="mobile-header-content">
              <img src="/product-logo.svg" width={40} height={40} />
              <div className="mobile-header-settings">
                <img 
                  src="/settings.svg" 
                  alt="Settings" 
                  height={18} 
                  width={18}
                  onClick={() => navigate('/setting')}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          </header>
        )}


        {renderComponent === "IndividualProduct" && <IndividualProduct setRenderComponent={setRenderComponent} refreshProducts={refreshProducts} />}
        {selectedProduct && <NewProduct product={selectedProduct} />}

        {renderComponent !== "IndividualProduct" && (
          <main className="product-content">
            {isMobile ? (
              // Mobile layout
              <>
                <section className="mobile-product-overview">
                  <h2>Overall Inventory</h2>
                  <div className="mobile-product-overview-grid">
                    <div className="mobile-product-card">
                      <p>Categories</p>
                      <div className="mobile-product-card-main-value">
                        <span className="large-number">{summary.categories || 14}</span>
                      </div>
                      <div className="mobile-product-card-meta">
                        <span>Last 7 days</span>
                      </div>
                    </div>
                    <div className="mobile-product-card">
                      <p>Total Products</p>
                      <div className="mobile-product-card-main-value horizontal">
                        <span className="large-number">{summary.totalProducts || 868}</span>
                        <span className="revenue-amount">₹{(summary.revenue || 25000).toFixed(2)}</span>
                      </div>
                      <div className="mobile-product-card-meta horizontal-labels">
                        <span>Last 7 days</span>
                        <span>Revenue</span>
                      </div>
                    </div>
                    <div className="mobile-product-card">
                      <p>Top Selling</p>
                      <div className="mobile-product-card-main-value horizontal">
                        <span className="large-number">5</span>
                        <span className="cost-amount">₹2500</span>
                      </div>
                      <div className="mobile-product-card-meta horizontal-labels">
                        <span>Last 7 days</span>
                        <span>Cost</span>
                      </div>
                    </div>
                    <div className="mobile-product-card">
                      <p>Low Stocks</p>
                      <div className="mobile-product-card-main-value horizontal">
                        <span className="large-number">{summary.notInStock || 12}</span>
                        <span className="secondary-number">{summary.ordered || 2}</span>
                      </div>
                      <div className="mobile-product-card-meta horizontal-labels">
                        <span>Ordered</span>
                        <span>Not in stock</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mobile-products">
                  <div className="mobile-products-header">
                    <h3>Products</h3>
                  </div>
                  <div className="mobile-products-table">
                    <div className="mobile-table-header">
                      <div className="mobile-header-cell">Product</div>
                      <div className="mobile-header-cell">Availability</div>
                    </div>
                    <div className="mobile-table-body">
                      {products.length === 0 ? (
                        <div className="mobile-no-products">
                          <p>No products found</p>
                        </div>
                      ) : (
                        products.map((product, index) => (
                          <div key={index} className="mobile-table-row">
                            <div className="mobile-product-name-cell">
                              {product.name}
                            </div>
                            <div className="mobile-availability-cell">
                              <span className={`availability-status ${product.status === "Expired" ? 'expired' :
                                  product.status === "Out of stock" || product.quantity === 0 ? 'out-of-stock' :
                                    product.quantity > product.threshold ? 'in-stock' : 'low-stock'
                                }`}>
                                {product.status === "Expired" ? 'Expired' :
                                  product.status === "Out of stock" || product.quantity === 0 ? 'Out of stock' :
                                    product.quantity > product.threshold ? 'In-stock' : 'Low stock'}
                              </span>
                              <img 
                                src="/Info.svg" 
                                className="mobile-info-icon"
                                onClick={(e) => handleInfoClick(e, product)}
                                alt="Product Info"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button className="mobile-add-product-fab" onClick={openAddProductModal}>
                    Add Product
                  </button>
                </section>
              </>
            ) : (
              <>
                <section className="product-overview">
                  <h2>Overall Inventory</h2>
                  <div className="product-overview-grid">
                    <div className="product-card">
                      <p>Categories</p>
                      <p>{summary.categories}</p>
                      <div className="product-card-meta">
                        <span>Last 7 days</span>
                      </div>
                    </div>
                    <div className="product-card">
                      <p>Total Products</p>
                      <div className="product-card-values">
                        <p>{summary.totalProducts}</p>
                        <p>₹{(summary.revenue || 0).toFixed(2)}</p>
                      </div>
                      <div className="product-card-meta">
                        <span>Last 7 days</span>
                        <span>Revenue</span>
                      </div>
                    </div>
                    <div className="product-card">
                      <p>Top Selling</p>
                      <div className="product-card-values">
                        <p>5</p>
                        <p>₹2500</p>
                      </div>
                      <div className="product-card-meta">
                        <span>Last 7 days</span>
                        <span>Cost</span>
                      </div>
                    </div>
                    <div className="product-card">
                      <p>Low Stocks</p>
                      <div className="product-card-values">
                        <p>{summary.ordered}</p> {/* Count of bought product items */}
                        <p>{summary.notInStock}</p> {/* Out of stock items (current) */}
                      </div>
                      <div className="product-card-meta">
                        <span>Ordered</span>
                        <span>Not in stock</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="products">
                  <div className="product-table-header">
                    <h3>Products</h3>
                    <button className="add-product-btn-product" onClick={openAddProductModal}>
                      Add Product
                    </button>
                  </div>

                  <div className="product-table-wrapper">
                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        Loading products...
                      </div>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Products</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Threshold Value</th>
                            <th>Expiry Date</th>
                            <th>Availability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => {
                            const isNotPurchasable = product.status === 'Expired' || product.quantity === 0;
                            return (
                              <tr
                                key={index}
                                style={{
                                  cursor: isNotPurchasable ? "not-allowed" : "pointer",
                                  opacity: isNotPurchasable ? 0.6 : 1
                                }}
                                onClick={() => handleRowClick(product)}
                                title={isNotPurchasable ? `Cannot purchase ${product.status === 'Expired' ? 'expired' : 'out-of-stock'} product` : 'Click to purchase'}
                              >
                                <td>
                                  {product.name}
                                </td>
                                <td>₹{product.price}</td>
                                <td>{product.quantity}</td>
                                <td>{product.threshold}</td>
                                <td>{new Date(product.expiry).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}</td>
                                <td className={getStatusClass(product.quantity, product.threshold, product.status)}>
                                  {getStatusText(product.quantity, product.threshold, product.status)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="pagination-product">
                    <button
                      className={`product-btn-outline ${currentPage === 1 ? 'cursor-disabled' : ''}`}
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      className={`product-btn-outline ${currentPage === totalPages ? 'cursor-disabled' : ''}`}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        )}
      </div>
      {renderComponent === "MultipleProduct" && (
        <MultipleProduct
          onClose={() => {
            setRenderComponent(null);
            setAddProductModalOpen(false);
          }}
          refreshProducts={refreshProducts}
        />
      )}
      {renderComponent !== "MultipleProduct" && isAddProductModalOpen && (
        <AddProduct
          onClose={closeAddProductModal}
          setRenderComponent={setRenderComponent}
          refreshProducts={() => refreshProducts(true)}
        />
      )}
      {isBuyModalOpen && (
        <PurchaseModal
          product={productToBuy}
          onClose={() => setBuyModalOpen(false)}
          onBuy={handleBuy}
        />
      )}
      
      {/* Mobile Product Info Modal */}
      {isMobile && isProductInfoModalOpen && selectedProductInfo && (
        <div className="mobile-product-info-overlay" onClick={closeProductInfoModal}>
          <div className="mobile-product-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-product-info-header">
              <h3>Products Details</h3>
              <button className="mobile-product-info-close" onClick={closeProductInfoModal}>
                <img src="/template_close.svg" alt="Close" />
              </button>
            </div>
            <div className="mobile-product-info-content">
              <div className="mobile-product-info-name">{selectedProductInfo.name}</div>
              <div className="mobile-product-info-details">
                <div className="mobile-product-info-item">
                  <span className="mobile-product-info-label">Price</span>
                  <span className="mobile-product-info-value">₹{selectedProductInfo.price}</span>
                </div>
                <div className="mobile-product-info-item">
                  <span className="mobile-product-info-label">Quantity</span>
                  <span className="mobile-product-info-value">{selectedProductInfo.quantity} {selectedProductInfo.unit || 'Packets'}</span>
                </div>
                <div className="mobile-product-info-item">
                  <span className="mobile-product-info-label">Threshold Value</span>
                  <span className="mobile-product-info-value">{selectedProductInfo.threshold} {selectedProductInfo.unit || 'Packets'}</span>
                </div>
                <div className="mobile-product-info-item">
                  <span className="mobile-product-info-label">Expiry Date</span>
                  <span className="mobile-product-info-value">
                    {new Date(selectedProductInfo.expiry).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />

      {/* Mobile Bottom Navigation - only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
}
