import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../Context/ContextProvider';
import SalesPurchaseChart from "./SalesPurchaseChart";
import CustomLegend from "./CustomLegend";
import "./DragDropGrid.css";
import "../css/Home.css"; // Import Home.css for styling

const DragDropGrid = () => {
  const { token, isInitialized } = useContext(AuthContext);
  
  // State for dashboard data
  const [summaryData, setSummaryData] = useState({
    // Inventory Summary
    quantityInHand: 0,
    toBeReceived: 200,
    
    // Product Summary
    numberOfSuppliers: 31,
    numberOfCategories: 0,
    
    // Purchase Overview
    totalPurchases: 0,
    purchaseCost: 0,
    cancelCount: 5,
    returnValue: 17432,
    
    // Sales Overview
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0
  });

  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Calculate profit
  const calculatedProfit = summaryData.totalRevenue - summaryData.totalCost;

  // Sample sales data for chart
  const salesData = [
    { month: "Jan", purchase: 48000, sales: 42000 },
    { month: "Feb", purchase: 50000, sales: 41000 },
    { month: "Mar", purchase: 38000, sales: 45000 },
    { month: "Apr", purchase: 30000, sales: 36000 },
    { month: "May", purchase: 37000, sales: 39000 },
    { month: "Jun", purchase: 23000, sales: 35000 },
    { month: "Jul", purchase: 28000, sales: 26000 },
    { month: "Aug", purchase: 23000, sales: 22000 },
    { month: "Sep", purchase: 37000, sales: 36000 },
    { month: "Oct", purchase: 25000, sales: 30000 },
  ];

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!token) {
      console.log('No token available, skipping dashboard data fetch');
      return;
    }

    try {
      // Fetch products summary for inventory and categories
      const productsResponse = await fetch('http://localhost:5000/api/products/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        
        setSummaryData(prev => ({
          ...prev,
          quantityInHand: productsData.totalProducts || 0,
          numberOfCategories: productsData.categories || 0,
          totalPurchases: productsData.ordered || 0,
          purchaseCost: productsData.revenue || 0
        }));
      }

      // Fetch invoice stats for sales overview
      const invoiceResponse = await fetch('http://localhost:5000/api/invoices/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        
        setSummaryData(prev => ({
          ...prev,
          totalSales: invoiceData.recentTransactions || 0,
          totalRevenue: invoiceData.paidAmount?.last7Days || 0,
          totalCost: invoiceData.unpaidAmount?.ordered || 0
        }));
      }

      // Fetch statistics for top products and chart data
      const statisticsResponse = await fetch('http://localhost:5000/api/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statisticsResponse.ok) {
        const statsData = await statisticsResponse.json();
        setTopProducts(statsData.topProducts || []);
        setChartData(statsData.chartData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (token && isInitialized) {
      fetchDashboardData();
    }
  }, [token, isInitialized]);

  // Component render functions from Home.jsx
  const renderSalesOverview = () => (
    <div className="home-card home-card-large home-card-white">
      <h2 className="home-card-title">Sales Overview</h2>
      <div className="home-metrics-grid home-card-body">
        <div className="home-metric">
          <img src="/Sales.svg" width={20} height={20} />
          <div className="home-metric-map">
            <div className="home-metric-value">{summaryData.totalSales?.toLocaleString() || '0'}</div>
            <div className="home-metric-label">Sales</div>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Revenue.svg" width={20} height={20} />
          <div className="home-metric-map">
            <div className="home-metric-value">₹ {summaryData.totalRevenue?.toLocaleString() || '0'}</div>
            <div className="home-metric-label">Revenue</div>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Profit.svg" width={20} height={20} />
          <div className="home-metric-map">
            <div className="home-metric-value">₹ {calculatedProfit?.toLocaleString() || '0'}</div>
            <div className="home-metric-label">Profit</div>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Cost.svg" width={20} height={20} />
          <div className="home-metric-map">
            <div className="home-metric-value">₹ {summaryData.totalCost?.toLocaleString() || '0'}</div>
            <div className="home-metric-label">Cost</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchaseOverview = () => (
    <div className="home-card home-card-large">
      <h2 className="home-card-title">Purchase Overview</h2>
      <div className="home-metrics-grid home-card-body">
        <div className="home-metric">
          <img src="/Purchase.svg" width={20} height={20} />
          <div className="home-metric-map">
            <p className="home-metric-value">{summaryData.totalPurchases?.toLocaleString() || '0'}</p>
            <p className="home-metric-label">Purchase</p>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Revenue.svg" width={20} height={20} />
          <div className="home-metric-map">
            <p className="home-metric-value">₹ {summaryData.purchaseCost?.toLocaleString() || '0'}</p>
            <p className="home-metric-label">Cost</p>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Cancel.svg" width={20} height={20} />
          <div className="home-metric-map">
            <p className="home-metric-value">{summaryData.cancelCount}</p>
            <p className="home-metric-label">Cancel</p>
          </div>
        </div>
        <div className="home-metric">
          <img src="/Return.svg" width={20} height={20} />
          <div className="home-metric-map">
            <p className="home-metric-value">₹ {summaryData.returnValue?.toLocaleString()}</p>
            <p className="home-metric-label">Return</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChart = () => (
    <div className="home-card home-card-large home-card-white home-chart-card">
      <div className="bar-graph-container">
        <SalesPurchaseChart chartData={chartData.length > 0 ? chartData : salesData} />
        <CustomLegend />
      </div>
    </div>
  );

  const renderInventorySummary = () => (
    <div className="home-card">
      <h2 className="home-card-title">Inventory Summary</h2>
      <div className="home-inventory-list">
        <div className="home-metric-text">
          <img src="/Quantity.svg" width={20} height={20} />
          <p className="home-metric-value">{summaryData.quantityInHand?.toLocaleString() || '0'}</p>
        </div>
        <div className="home-metric-text">
          <img src="/to_be_received.svg" width={20} height={20} />
          <p className="home-metric-value">{summaryData.toBeReceived?.toLocaleString() || '200'}</p>
        </div>
      </div>
      <div className="summary-labels">
        <p className="home-metric-label-2">Quantity in Hand</p>
        <p className="home-metric-label-2">To be received</p>
      </div>
    </div>
  );

  const renderProductSummary = () => (
    <div className="home-card home-card-white">
      <h2 className="home-card-title">Product Summary</h2>
      <div className="home-inventory-list">
        <div className="home-metric-text">
          <img src="/Suppliers.svg" width={20} height={20} />
          <p className="home-metric-value">{summaryData.numberOfSuppliers}</p>
        </div>
        <div className="home-metric-text">
          <img src="/Categories.svg" width={20} height={20} />
          <p className="home-metric-value">{summaryData.numberOfCategories?.toLocaleString() || '0'}</p>
        </div>
      </div>
      <div className="summary-labels">
        <p className="home-metric-label-2">Number of Suppliers</p>
        <p className="home-metric-label-2">Number of Categories</p>
      </div>
    </div>
  );

  const renderTopProducts = () => (
    <div className="home-card home-card-white" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="home-card-header">
        <h2 className="home-card-title">Top Products</h2>
      </div>
      <div className="card-body top-products">
        {topProducts.length > 0 ? (
          topProducts.map((product, i) => (
            <div key={i} className="top-product-row">
              <div className="product-info">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-thumbnail"
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '6px',
                      objectFit: 'cover',
                      marginRight: '12px',
                      border: '1px solid #e0e0e0'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div 
                    className="product-placeholder"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      border: '1px solid #e0e0e0',
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: 'bold'
                    }}
                  >
                    {product.name?.charAt(0) || 'P'}
                  </div>
                )}
                <span className="product-name">{product.name}</span>
              </div>
              <div className="product-stats">
                <div className="product-stars">{renderStars(product.rating)}</div>
                {product.totalSold && (
                  <span className="product-sold">Sold: {product.totalSold}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            No product sales data available
          </div>
        )}
      </div>
    </div>
  );

  // Drag and drop logic
  useEffect(() => {
    const containers = document.querySelectorAll('.grid-container');
    const eventListeners = [];

    containers.forEach(container => {
      let draggedItem = null;

      // Event listener for when you start dragging an item
      const handleDragStart = (e) => {
        // Ensure we are dragging a grid-item
        if (e.target.classList.contains('grid-item')) {
          draggedItem = e.target;
          // Use a timeout to allow the browser to create a drag image
          // before we apply the 'dragging' class
          setTimeout(() => {
            e.target.classList.add('dragging');
          }, 0);
        }
      };

      // Event listener for when you stop dragging
      const handleDragEnd = (e) => {
        if (draggedItem) {
          draggedItem.classList.remove('dragging');
          draggedItem = null;
        }
      };

      // Event listener for when a dragged item is over the container
      const handleDragOver = (e) => {
        e.preventDefault(); // This is necessary to allow dropping

        const afterElement = getDragAfterElement(container, e.clientY);
        const currentlyDragged = document.querySelector('.dragging');

        if (currentlyDragged) {
          if (afterElement == null) {
            // If there's no element below, append to the end
            container.appendChild(currentlyDragged);
          } else {
            // Otherwise, insert it before the element it's over
            container.insertBefore(currentlyDragged, afterElement);
          }
        }
      };

      container.addEventListener('dragstart', handleDragStart);
      container.addEventListener('dragend', handleDragEnd);
      container.addEventListener('dragover', handleDragOver);

      // Store for cleanup
      eventListeners.push({
        container,
        events: [
          { type: 'dragstart', handler: handleDragStart },
          { type: 'dragend', handler: handleDragEnd },
          { type: 'dragover', handler: handleDragOver }
        ]
      });
    });

    /**
     * Determines which element the dragged item should be placed before.
     * It calculates this based on the mouse's vertical position (y).
     * @param {HTMLElement} container - The container element for the grid items.
     * @param {number} y - The vertical coordinate of the mouse.
     * @returns {HTMLElement|null} The element to insert before, or null to append at the end.
     */
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.grid-item:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        // Calculate the offset between the mouse position and the center of the element
        const offset = y - box.top - box.height / 2;
        
        // We are looking for the element that is just below the cursor
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Cleanup function
    return () => {
      eventListeners.forEach(({ container, events }) => {
        events.forEach(({ type, handler }) => {
          container.removeEventListener(type, handler);
        });
      });
    };
  }, []);

  return (
    <div className="drag-drop-container">
      <header className="page-header">
        <h1 className="page-title">Drag & Drop Dashboard</h1>
        <p className="page-subtitle">Drag dashboard widgets within each column to reorder them vertically.</p>
      </header>

      {/* Main container for both grids */}
      <main className="main-content">
        {/* Left Grid Container */}
        <div id="left-container" className="grid-container">
          <div className="grid-item left" draggable="true">
            {renderSalesOverview()}
          </div>
          <div className="grid-item left" draggable="true">
            {renderPurchaseOverview()}
          </div>
          <div className="grid-item left" draggable="true">
            {renderChart()}
          </div>
        </div>

        {/* Right Grid Container */}
        <div id="right-container" className="grid-container">
          <div className="grid-item right" draggable="true">
            {renderInventorySummary()}
          </div>
          <div className="grid-item right" draggable="true">
            {renderProductSummary()}
          </div>
          <div className="grid-item right" draggable="true">
            {renderTopProducts()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DragDropGrid;
