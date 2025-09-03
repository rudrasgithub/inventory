import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../Context/ContextProvider';
import "../css/Home.css";
import Sidebar from "../components/Sidebar";
import MobileHeader from "../components/MobileHeader";
import BottomNav from "../components/BottomNav";
import SalesPurchaseChart from "../components/SalesPurchaseChart";
import CustomLegend from "../components/CustomLegend";
import TopProducts from "../components/TopProducts";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Home() {
  const { token, isInitialized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
  const [isLoading, setIsLoading] = useState(true);

  // Grid layout state
  const [leftColumnOrder, setLeftColumnOrder] = useState([0, 1, 2]);
  const [rightColumnOrder, setRightColumnOrder] = useState([0, 1, 2]);
  const [draggedGrid, setDraggedGrid] = useState(null);
  const saveTimeoutRef = useRef(null);

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

  const saveGridLayout = async (layout) => {
    if (!token) return;
    
    // Clear any existing timeout to prevent multiple rapid calls
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Save to database
        const response = await fetch(`${API_BASE_URL}/api/statistics/user/layout`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ homeLayout: layout })
        });

        if (response.ok) {
          toast.success('Layout saved successfully!');
          console.log('Home grid layout saved to database');
        } else {
          toast.error('Failed to save layout.');
        }
      } catch (error) {
        console.error('Error saving home layout to database:', error);
        toast.error('Failed to save layout.');
        // Fallback to localStorage
        try {
          localStorage.setItem('gridLayout', JSON.stringify(layout));
          console.log('Grid layout saved to localStorage as fallback');
        } catch (localError) {
          console.log('Could not save grid layout to localStorage');
        }
      }
    }, 500); // 500ms debounce
  };

  const loadGridLayout = async () => {
    if (!token) return;
    
    try {
      // Load from database first
      const response = await fetch(`${API_BASE_URL}/api/statistics/user/layout`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.homeLayout) {
          const layout = data.homeLayout;
          if (layout.leftColumn) setLeftColumnOrder(layout.leftColumn);
          if (layout.rightColumn) setRightColumnOrder(layout.rightColumn);
          console.log('Home grid layout loaded from database');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading home layout from database:', error);
    }

    // Fallback to localStorage if database fails
    try {
      const savedLayout = localStorage.getItem('gridLayout');
      if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        if (layout.leftColumn) setLeftColumnOrder(layout.leftColumn);
        if (layout.rightColumn) setRightColumnOrder(layout.rightColumn);
        console.log('Grid layout loaded from localStorage as fallback');
      }
    } catch (error) {
      console.log('Could not load grid layout from localStorage, using default layout');
    }
  };

  const resetGridLayout = async () => {
    const defaultLayout = {
      leftColumn: [0, 1, 2],
      rightColumn: [0, 1, 2]
    };
    
    setLeftColumnOrder(defaultLayout.leftColumn);
    setRightColumnOrder(defaultLayout.rightColumn);
    
    if (!token) {
      toast.success('Layout reset to default!');
      return;
    }
    
    try {
      // Reset in database
      const response = await fetch(`${API_BASE_URL}/api/statistics/user/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ homeLayout: defaultLayout })
      });

      if (response.ok) {
        toast.success('Layout reset to default!');
        console.log('Home grid layout reset in database');
      } else {
        toast.error('Failed to reset layout in database.');
      }
    } catch (error) {
      console.error('Error resetting home layout in database:', error);
      toast.error('Failed to reset layout in database.');
      // Clear localStorage as fallback
      try {
        localStorage.removeItem('gridLayout');
        console.log('Grid layout cleared from localStorage as fallback');
      } catch (localError) {
        console.log('Could not clear grid layout from localStorage');
      }
    }
  };

  const fetchDashboardData = async () => {
    if (!token) {
      console.log('No token available, skipping dashboard data fetch');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch products summary for inventory and categories
      const productsResponse = await fetch(`${API_BASE_URL}/api/products/summary`, {
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

      // Fetch statistics for top products, chart data, and sales overview
      const statisticsResponse = await fetch(`${API_BASE_URL}/api/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statisticsResponse.ok) {
        const statsData = await statisticsResponse.json();
        setTopProducts(statsData.topProducts || []);
        setChartData(statsData.chartData || []);
        
        // Update sales overview with data from statistics
        setSummaryData(prev => ({
          ...prev,
          totalSales: statsData.productsSold?.value || 0,
          totalRevenue: statsData.totalRevenue?.value || 0,
          totalCost: statsData.totalCost?.value || 0,
          totalProfit: statsData.totalProfit?.value || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !token) {
      navigate('/login');
    }
  }, [token, isInitialized, navigate]);

  // Advanced mouse-based drag and drop logic - Based on working HTML reference
  useEffect(() => {
    // Disable drag and drop on mobile screens or during loading
    if (isMobile || isLoading) {
      console.log('Home.jsx: Drag and drop disabled - mobile:', isMobile, 'loading:', isLoading);
      return;
    }

    console.log('Home.jsx: useEffect for drag-drop is running');

    // Longer delay to ensure DOM is fully rendered after loading
    const timeoutId = setTimeout(() => {
      const gridItems = document.querySelectorAll('.grid-item:not(.mobile)');
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

      const onMouseDown = function (e) {
        // Prevent drag from starting on interactive elements
        if (e.target.closest('select, button, a')) {
          return;
        }
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

      const onMouseMove = function (e) {
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

      const onMouseUp = function (e) {
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
          const newOrder = Array.from(container.children).map(child => parseInt(child.dataset.id));

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

      const getDragAfterElement = function (container, y) {
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
    }, 300); // Increased timeout to ensure loading is complete

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMobile, isLoading]); // Remove leftColumnOrder and rightColumnOrder dependencies, add isLoading

  useEffect(() => {
    if (token && isInitialized) {
      fetchDashboardData();
      loadGridLayout();
    }
  }, [token, isInitialized]);

  // If not initialized or no token, don't render anything (will redirect)
  if (!isInitialized || !token) {
    return null;
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="dashboard-home">
        {!isMobile && <Sidebar />}
        <main className="main-home">
          {!isMobile && <header className="header-main"><h1>Home</h1></header>}
          {isMobile && <MobileHeader />}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white', fontSize: '18px' }}>
            Loading dashboard...
          </div>
        </main>
        {isMobile && <BottomNav />}
      </div>
    );
  }

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
            <div className="home-metric-value">₹ {summaryData.totalProfit?.toLocaleString() || '0'}</div>
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
    <div className="home-card home-card-large home-card-white home-chart-card" style={{ pointerEvents: 'auto', zIndex: 1 }}>
      <div className="bar-graph-container">
        <SalesPurchaseChart chartData={chartData} />
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
      <TopProducts
        topProducts={topProducts}
        className="home-style"
      />
    </div>
  );

  // Grid component arrays
  const leftGridComponents = [renderSalesOverview, renderPurchaseOverview, renderChart];
  const rightGridComponents = [renderInventorySummary, renderProductSummary, renderTopProducts];

  return (
    <div className="dashboard-home">
      {!isMobile && <Sidebar />}
      <main className="main-home">
        {!isMobile && <header className="header-main"><h1>Home</h1></header>}

  {isMobile && <MobileHeader />}

        <section className="grid-layout-home draggable-layout">
          {isMobile ? (
            <div className="mobile-grid-container">
              <div className="grid-item mobile">
                {renderChart()}
              </div>
              <div className="grid-item mobile">
                {renderSalesOverview()}
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
            <>
              <div className="grid-column left-column">
                {leftColumnOrder.map(id => (
                  <div key={id} data-id={id} className="grid-item left">
                    {leftGridComponents[id]()}
                  </div>
                ))}
              </div>

              {/* Right Grid Container */}
              <div className="grid-column right-column">
                {rightColumnOrder.map(id => (
                  <div key={id} data-id={id} className="grid-item right">
                    {rightGridComponents[id]()}
                  </div>
                ))}
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
