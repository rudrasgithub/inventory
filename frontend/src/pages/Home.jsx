import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from '../Context/ContextProvider';
import "../css/Home.css";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import SalesPurchaseChart from "../components/SalesPurchaseChart";
import CustomLegend from "../components/CustomLegend";

export default function Home() {
  const { token, isInitialized } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const [summaryData, setSummaryData] = useState({
    // Inventory Summary
    quantityInHand: 0, // Total available product items (sum of current quantities)
    toBeReceived: 200, // Static as requested
    
    // Product Summary
    numberOfSuppliers: 31, // Static as requested
    numberOfCategories: 0, // Dynamic - distinct count of categories
    
    // Purchase Overview
    totalPurchases: 0, // Total product items purchased by user
    purchaseCost: 0,   // Total cost of purchases
    cancelCount: 5,    // Static as requested
    returnValue: 17432, // Static as requested
    
    // Sales Overview
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0
  });

  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // Grid layout state
  const [leftColumnOrder, setLeftColumnOrder] = useState([0, 1, 2]);
  const [rightColumnOrder, setRightColumnOrder] = useState([0, 1, 2]);
  const [draggedGrid, setDraggedGrid] = useState(null);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 414);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Grid management functions
  const moveGridToPosition = (column, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const setOrder = column === 'left' ? setLeftColumnOrder : setRightColumnOrder;
    const currentOrder = column === 'left' ? leftColumnOrder : rightColumnOrder;
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setOrder(newOrder);
    saveGridLayout({
      leftColumn: column === 'left' ? newOrder : leftColumnOrder,
      rightColumn: column === 'right' ? newOrder : rightColumnOrder
    });
  };

  // Advanced mouse-based drag and drop logic - Based on working HTML reference
  useEffect(() => {
    // Disable drag and drop on mobile screens
    if (isMobile) {
      console.log('Home.jsx: Drag and drop disabled on mobile');
      return;
    }
    
    console.log('Home.jsx: useEffect for drag-drop is running');
    console.log('Home.jsx: leftColumnOrder:', leftColumnOrder);
    console.log('Home.jsx: rightColumnOrder:', rightColumnOrder);
    
    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      const gridItems = document.querySelectorAll('.grid-item');
      console.log('Home.jsx: Found grid items:', gridItems.length);
      
      if (gridItems.length === 0) {
        console.error('Home.jsx: No .grid-item elements found!');
        return;
      }
      
      gridItems.forEach((item, index) => {
        console.log(`Home.jsx: Grid item ${index}:`, item.className);
      });

      let draggedItem = null;
      let initialMouseY = 0;
      let initialPositions = new Map();

    const onMouseDown = function(e) {
      console.log('Home.jsx: onMouseDown triggered', e.target);
      e.preventDefault();

      draggedItem = this;
      console.log('Home.jsx: draggedItem:', draggedItem);
      
      const container = draggedItem.parentElement;
      initialPositions.set(container, container.getBoundingClientRect());

      const siblings = Array.from(container.children);
      siblings.forEach(child => {
        initialPositions.set(child, child.getBoundingClientRect());
      });
      
      initialMouseY = e.clientY;
      draggedItem.classList.add('is-dragging');

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = function(e) {
      if (!draggedItem) return;

      const container = draggedItem.parentElement;
      const containerRect = initialPositions.get(container);
      const draggedItemInitialRect = initialPositions.get(draggedItem);
      
      let deltaY = e.clientY - initialMouseY;

      // --- Constrain dragging within the container ---
      const futureTop = draggedItemInitialRect.top + deltaY;
      const futureBottom = draggedItemInitialRect.bottom + deltaY;
      const containerPadding = 24;

      if (futureTop < containerRect.top + containerPadding) {
        deltaY = (containerRect.top + containerPadding) - draggedItemInitialRect.top;
      }
      if (futureBottom > containerRect.bottom - containerPadding) {
        deltaY = (containerRect.bottom - containerPadding) - draggedItemInitialRect.bottom;
      }

      // Move the dragged item
      draggedItem.style.transform = `translateY(${deltaY}px)`;

      const draggedCurrentRect = {
        top: draggedItemInitialRect.top + deltaY,
        bottom: draggedItemInitialRect.bottom + deltaY
      };

      const draggedItemHeight = draggedItemInitialRect.height;
      const gap = 16;

      // --- Scaled Proportional Override Logic ---
      for (const sibling of container.children) {
        if (sibling === draggedItem) continue;

        const siblingInitialRect = initialPositions.get(sibling);
        const siblingHeight = siblingInitialRect.height;
        let translation = 0;
        
        // If dragged item and sibling overlap vertically
        if (draggedCurrentRect.bottom > siblingInitialRect.top && draggedCurrentRect.top < siblingInitialRect.bottom) {
          const requiredDisplacement = draggedItemHeight + gap;

          // Case 1: Dragging DOWN over a sibling that was initially below
          if (deltaY > 0 && siblingInitialRect.top > draggedItemInitialRect.top) {
            const overlap = draggedCurrentRect.bottom - siblingInitialRect.top;
            // Scale the movement: as overlap approaches siblingHeight, translation approaches requiredDisplacement
            const overlapRatio = Math.min(overlap / siblingHeight, 1);
            translation = -overlapRatio * requiredDisplacement;
          } 
          
          // Case 2: Dragging UP over a sibling that was initially above
          else if (deltaY < 0 && siblingInitialRect.top < draggedItemInitialRect.top) {
            const overlap = siblingInitialRect.bottom - draggedCurrentRect.top;
            const overlapRatio = Math.min(overlap / siblingHeight, 1);
            translation = overlapRatio * requiredDisplacement;
          }
        }
        
        sibling.style.transform = `translateY(${translation}px)`;
      }
    };

    const onMouseUp = function(e) {
      if (!draggedItem) return;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const container = draggedItem.parentElement;
      
      // Determine final order based on the mouse position at drop
      const dropTarget = getDragAfterElement(container, e.clientY);
      const siblings = [...container.children];
      const finalOrder = siblings.filter(child => child !== draggedItem);
      const dropIndex = dropTarget ? finalOrder.indexOf(dropTarget) : finalOrder.length;
      finalOrder.splice(dropIndex, 0, draggedItem);
      
      // Animate every item to its correct final resting place
      siblings.forEach(child => {
        const initialPos = initialPositions.get(child);
        const newIndex = finalOrder.indexOf(child);
        
        let newTop = initialPositions.get(container).top + 24; // container top + padding
        const gap = 16; // 1rem

        for (let i = 0; i < newIndex; i++) {
          const itemAbove = finalOrder[i];
          const itemAboveRect = initialPositions.get(itemAbove);
          newTop += itemAboveRect.height + gap;
        }
        
        const deltaY = newTop - initialPos.top;

        child.style.transition = 'transform 0.2s ease-in-out';
        child.style.transform = `translateY(${deltaY}px)`;
      });

      // After the animation, clean up and reorder the DOM
      setTimeout(() => {
        finalOrder.forEach(item => container.appendChild(item));

        for (const child of container.children) {
          child.style.transition = '';
          child.style.transform = '';
          child.classList.remove('is-dragging');
        }
        
        // Save the new order to state and backend
        const isLeftColumn = container.classList.contains('left-column');
        const newOrder = Array.from(container.children).map((child, index) => index);
        
        if (isLeftColumn) {
          setLeftColumnOrder(newOrder);
          saveGridLayout({
            leftColumn: newOrder,
            rightColumn: rightColumnOrder
          });
        } else {
          setRightColumnOrder(newOrder);
          saveGridLayout({
            leftColumn: leftColumnOrder,
            rightColumn: newOrder
          });
        }
        
        draggedItem = null;
        initialPositions.clear();
      }, 200);
    };

    const getDragAfterElement = function(container, y) {
      const draggableElements = [...container.querySelectorAll('.grid-item:not(.is-dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    // Attach event listeners
    gridItems.forEach((item, index) => {
      console.log(`Home.jsx: Attaching mousedown listener to item ${index}:`, item);
      item.addEventListener('mousedown', onMouseDown);
    });

    console.log('Home.jsx: All event listeners attached');

    // Cleanup function
    return () => {
      console.log('Home.jsx: Cleaning up event listeners');
      gridItems.forEach(item => {
        item.removeEventListener('mousedown', onMouseDown);
      });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [leftColumnOrder, rightColumnOrder, isMobile]); // Added isMobile dependency

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('.draggable-grid:not(.is-dragging)')];

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
  };

  const saveGridLayout = async (layout) => {
    if (!token) return;
    
    try {
      await fetch('http://localhost:5000/api/user/grid-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(layout)
      });
    } catch (error) {
      console.error('Error saving grid layout:', error);
    }
  };

  const loadGridLayout = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/user/grid-layout', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const layout = await response.json();
        if (layout.leftColumn) setLeftColumnOrder(layout.leftColumn);
        if (layout.rightColumn) setRightColumnOrder(layout.rightColumn);
      }
    } catch (error) {
      console.error('Error loading grid layout:', error);
    }
  };

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
          quantityInHand: productsData.totalProducts || 0, // Total available items
          numberOfCategories: productsData.categories || 0, // Distinct categories count
          totalPurchases: productsData.ordered || 0, // Total purchased items
          purchaseCost: productsData.revenue || 0 // Total purchase cost
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
      loadGridLayout();
    }
  }, [token, isInitialized]);

  // Grid component definitions
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

  // Grid component arrays (no longer needed for dynamic ordering, but keeping for reference)
  const leftGridComponents = [renderSalesOverview, renderPurchaseOverview, renderChart];
  const rightGridComponents = [renderInventorySummary, renderProductSummary, renderTopProducts];

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

  // Calculate profit (revenue - cost)
  const calculatedProfit = summaryData.totalRevenue - summaryData.totalCost;

  return (
    <div className="dashboard-home">
      {!isMobile && <Sidebar />}
      <main className="main-home">
        {/* Only show header on desktop */}
        {!isMobile && <header className="header-main"><h1>Home</h1></header>}
        
        <section className="grid-layout-home draggable-layout">
          {isMobile ? (
            // Mobile: Single Column Layout
            <div className="mobile-grid-container">
              <div className="grid-item mobile">
                {renderSalesOverview()}
              </div>
              <div className="grid-item mobile">
                {renderChart()}
              </div>
              <div className="grid-item mobile">
                {renderPurchaseOverview()}
              </div>
              <div className="grid-item mobile">
                {renderInventorySummary()}
              </div>
              <div className="grid-item mobile">
                {renderProductSummary()}
              </div>
              <div className="grid-item mobile">
                {renderTopProducts()}
              </div>
            </div>
          ) : (
            // Desktop: Two Column Layout
            <>
              {/* Left Grid Container */}
              <div className="grid-column left-column">
                <div className="grid-item left">
                  {renderSalesOverview()}
                </div>
                <div className="grid-item left">
                  {renderPurchaseOverview()}
                </div>
                <div className="grid-item left">
                  {renderChart()}
                </div>
              </div>

              {/* Right Grid Container */}
              <div className="grid-column right-column">
                <div className="grid-item right">
                  {renderInventorySummary()}
                </div>
                <div className="grid-item right">
                  {renderProductSummary()}
                </div>
                <div className="grid-item right">
                  {renderTopProducts()}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      
      {/* Mobile Bottom Navigation - only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  );
}
