import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import "../css/Statistics.css";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import SalesPurchaseChart from "./SalesPurchaseChart";
import CustomLegend from "./CustomLegend";

export default function Statistics() {
  const { token } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);
  const [statistics, setStatistics] = useState({
    totalRevenue: { value: 0, change: 0 },
    productsSold: { value: 0, change: 0 },
    productsInStock: { value: 0, change: 0 },
    chartData: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  
  // Layout state for drag and drop
  const [cardLayout, setCardLayout] = useState({
    firstRow: [0, 1, 2], // Total Revenue, Products Sold, Products In Stock
    secondRow: [3, 4] // Sales & Purchase Chart, Top Products
  });
  
  // Drag state
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    draggedFromRow: null,
    initialPositions: new Map(),
    initialMouseX: 0
  });

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Card data mapping
  const cardData = [
    {
      id: 0,
      title: "Total Revenue",
      value: statistics.totalRevenue.value,
      change: statistics.totalRevenue.change,
      className: "yellow",
      format: "currency"
    },
    {
      id: 1,
      title: "Products Sold",
      value: statistics.productsSold.value,
      change: statistics.productsSold.change,
      className: "teal",
      format: "number"
    },
    {
      id: 2,
      title: "Products In Stock",
      value: statistics.productsInStock.value,
      change: statistics.productsInStock.change,
      className: isMobile ? "purple" : "pink",
      format: "number"
    },
    {
      id: 3,
      title: "Sales & Purchase",
      component: (
        <div className="statistics-graph-card">
          <SalesPurchaseChart chartData={statistics.chartData} />
          <CustomLegend />
        </div>
      ),
      className: "chart-card-wrapper",
      flexGrow: 2
    },
    {
      id: 4,
      title: "Top Products",
      component: (
        <div className="top-products-card">
          <h3>Top Products</h3>
          <div className="top-products-statistics">
            {statistics.topProducts.map((product, index) => (
              <div key={index} className="statistics-product">
                <span>{product.name}</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < product.rating ? "filled" : ""}`}
                    ></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      className: "top-products-card-wrapper",
      flexGrow: 1
    }
  ];

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 414);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user layout
  const fetchUserLayout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/layout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statisticsLayout) {
          setCardLayout(data.statisticsLayout);
        }
      }
    } catch (error) {
      console.error('Error fetching user layout:', error);
    }
  };

  // Save layout to backend
  const saveLayoutToBackend = async (newLayout) => {
    try {
      await fetch(`${API_BASE_URL}/api/user/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          statisticsLayout: newLayout
        })
      });
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
        } else {
          console.error('Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStatistics();
      fetchUserLayout();
    }
  }, [token]);

  // Drag and Drop Handlers
  const handleMouseDown = (e, cardId, rowType) => {
    if (isMobile) return; // Disable drag on mobile
    
    e.preventDefault();
    
    const container = e.currentTarget.parentElement;
    const initialPositions = new Map();
    
    // Store initial positions
    initialPositions.set(container, container.getBoundingClientRect());
    Array.from(container.children).forEach(child => {
      initialPositions.set(child, child.getBoundingClientRect());
    });

    setDragState({
      isDragging: true,
      draggedItem: cardId,
      draggedFromRow: rowType,
      initialPositions,
      initialMouseX: e.clientX
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDragging) return;

    const { draggedItem, draggedFromRow, initialPositions, initialMouseX } = dragState;
    const draggedElement = document.querySelector(`[data-card-id="${draggedItem}"]`);
    if (!draggedElement) return;

    const container = draggedElement.parentElement;
    const containerRect = initialPositions.get(container);
    const draggedItemInitialRect = initialPositions.get(draggedElement);
    
    let deltaX = e.clientX - initialMouseX;

    // Constrain dragging within container
    const containerPadding = 16;
    const futureLeft = draggedItemInitialRect.left + deltaX;
    const futureRight = draggedItemInitialRect.right + deltaX;

    if (futureLeft < containerRect.left + containerPadding) {
      deltaX = (containerRect.left + containerPadding) - draggedItemInitialRect.left;
    }
    if (futureRight > containerRect.right - containerPadding) {
      deltaX = (containerRect.right - containerPadding) - draggedItemInitialRect.right;
    }

    // Move the dragged item
    draggedElement.style.transform = `translateX(${deltaX}px)`;

    const draggedCurrentRect = {
      left: draggedItemInitialRect.left + deltaX,
      right: draggedItemInitialRect.right + deltaX
    };

    const draggedItemWidth = draggedItemInitialRect.width;
    const gap = 16;

    // Move other items proportionally
    for (const sibling of container.children) {
      if (sibling === draggedElement) continue;

      const siblingInitialRect = initialPositions.get(sibling);
      const siblingWidth = siblingInitialRect.width;
      let translation = 0;
      
      if (draggedCurrentRect.right > siblingInitialRect.left && draggedCurrentRect.left < siblingInitialRect.right) {
        const requiredDisplacement = draggedItemWidth + gap;

        if (deltaX > 0 && siblingInitialRect.left > draggedItemInitialRect.left) {
          const overlap = draggedCurrentRect.right - siblingInitialRect.left;
          const overlapRatio = Math.min(overlap / siblingWidth, 1);
          translation = -overlapRatio * requiredDisplacement;
        } else if (deltaX < 0 && siblingInitialRect.left < draggedItemInitialRect.left) {
          const overlap = siblingInitialRect.right - draggedCurrentRect.left;
          const overlapRatio = Math.min(overlap / siblingWidth, 1);
          translation = overlapRatio * requiredDisplacement;
        }
      }
      
      sibling.style.transform = `translateX(${translation}px)`;
    }
  };

  const handleMouseUp = (e) => {
    if (!dragState.isDragging) return;

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const { draggedItem, draggedFromRow, initialPositions } = dragState;
    const draggedElement = document.querySelector(`[data-card-id="${draggedItem}"]`);
    if (!draggedElement) return;

    const container = draggedElement.parentElement;
    const dropTarget = getDragAfterElementHorizontal(container, e.clientX);
    
    // Calculate new order
    const currentRow = cardLayout[draggedFromRow];
    const siblings = currentRow.filter(id => id !== draggedItem);
    const dropIndex = dropTarget ? siblings.indexOf(dropTarget) : siblings.length;
    const newOrder = [...siblings];
    newOrder.splice(dropIndex, 0, draggedItem);

    // Update layout
    const newLayout = {
      ...cardLayout,
      [draggedFromRow]: newOrder
    };

    // Animate to final positions
    const finalOrder = newOrder.map(id => document.querySelector(`[data-card-id="${id}"]`));
    finalOrder.forEach((child, index) => {
      if (!child) return;
      
      const initialPos = initialPositions.get(child);
      let newLeft = initialPositions.get(container).left + 16; // container left + padding
      
      for (let i = 0; i < index; i++) {
        const itemAbove = finalOrder[i];
        if (itemAbove) {
          const itemAboveRect = initialPositions.get(itemAbove);
          newLeft += itemAboveRect.width + 16;
        }
      }
      
      const deltaX = newLeft - initialPos.left;
      child.style.transition = 'transform 0.2s ease-in-out';
      child.style.transform = `translateX(${deltaX}px)`;
    });

    setTimeout(() => {
      // Update state and reset styles
      setCardLayout(newLayout);
      saveLayoutToBackend(newLayout);
      
      // Reset all transforms and transitions
      Array.from(container.children).forEach(child => {
        child.style.transition = '';
        child.style.transform = '';
        child.classList.remove('is-dragging');
      });
      
      setDragState({
        isDragging: false,
        draggedItem: null,
        draggedFromRow: null,
        initialPositions: new Map(),
        initialMouseX: 0
      });
    }, 200);
  };

  const getDragAfterElementHorizontal = (container, x) => {
    const draggableElements = [...container.querySelectorAll('.draggable-card:not(.is-dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: parseInt(child.dataset.cardId) };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}% from last month`;
  };

  return (
    <div className="statistics-dashboard">
      {!isMobile && <Sidebar />}

      <div className="statistics-main">
        {/* Desktop header */}
        {!isMobile && (
          <header className="statistics-header">
            <h1>Statistics</h1>
          </header>
        )}

        {/* Mobile header */}
        {isMobile && (
          <header className="mobile-header">
            <div className="mobile-header-content">
              <img src="/product-logo.svg" alt="product logo" height={47} width={47} />
              <div className="mobile-header-settings">
                <img src="/settings.svg" alt="Settings" height={18} width={18} />
              </div>
            </div>
          </header>
        )}

        <main className="content-statistics">
          {isMobile ? (
            // Mobile layout: Chart first, then cards at bottom
            <>
              <div className="mobile-chart-section">
                <div className="statistics-graph-card">
                  <SalesPurchaseChart chartData={statistics.chartData} />
                  <CustomLegend />
                </div>
              </div>
              
              <div className="mobile-cards-statistics">
                <div className="card-statistics yellow">
                  <p>Total Revenue</p>
                  <h2>{formatCurrency(statistics.totalRevenue.value)}</h2>
                  <span>
                    {formatPercentage(statistics.totalRevenue.change)}
                  </span>
                </div>
                <div className="card-statistics teal">
                  <p>Products Sold</p>
                  <h2>{statistics.productsSold.value.toLocaleString()}</h2>
                  <span>
                    {formatPercentage(statistics.productsSold.change)}
                  </span>
                </div>
                <div className="card-statistics purple">
                  <p>Products In Stock</p>
                  <h2>{statistics.productsInStock.value.toLocaleString()}</h2>
                  <span>
                    {formatPercentage(statistics.productsInStock.change)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="cards-statistics draggable-row" data-row-type="firstRow">
                {cardLayout.firstRow.map((cardId) => {
                  const card = cardData.find(c => c.id === cardId);
                  if (!card) return null;
                  
                  return (
                    <div
                      key={card.id}
                      data-card-id={card.id}
                      className={`card-statistics draggable-card ${card.className} ${
                        dragState.isDragging && dragState.draggedItem === card.id ? 'is-dragging' : ''
                      }`}
                      onMouseDown={(e) => handleMouseDown(e, card.id, 'firstRow')}
                      style={{ cursor: 'grab' }}
                    >
                      <p>{card.title}</p>
                      <h2>
                        {card.format === 'currency' 
                          ? formatCurrency(card.value)
                          : card.value.toLocaleString()
                        }
                      </h2>
                      <span>{formatPercentage(card.change)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="charts-section">
                <div className="statistics-graph-card">
                  <SalesPurchaseChart chartData={statistics.chartData} />
                  <CustomLegend />
                </div>

                <div className="top-products-card">
                  <h3>Top Products</h3>
                  <div className="top-products-statistics">
                    {statistics.topProducts.map((product, index) => (
                      <div key={index} className="statistics-product">
                        <span>{product.name}</span>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < product.rating ? "filled" : ""}`}
                            ></span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
      
      {/* Mobile Bottom Navigation - only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  )
}
