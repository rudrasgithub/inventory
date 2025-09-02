import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/ContextProvider';
import { useDraggableRows } from '../hooks/useDraggableRows';
import "../css/Statistics.css";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import SalesPurchaseChart from "./SalesPurchaseChart";
import CustomLegend from "./CustomLegend";

export default function Statistics() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [statistics, setStatistics] = useState({
    totalRevenue: { value: 0, change: 0 },
    productsSold: { value: 0, change: 0 },
    productsInStock: { value: 0, change: 0 },
    chartData: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [layoutLoading, setLayoutLoading] = useState(true);
  
  const [initialLayout, setInitialLayout] = useState({
    firstRow: [0, 1, 2],
    secondRow: [3, 4]
  });

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch user layout and update initialLayout
  useEffect(() => {
    const fetchUserLayout = async () => {
      if (!token) {
        setLayoutLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/layout`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.statisticsLayout) {
            setInitialLayout(data.statisticsLayout);
          }
        }
      } catch (error) {
        console.error('Error fetching user layout:', error);
      } finally {
        setLayoutLoading(false);
      }
    };
    fetchUserLayout();
  }, [token]);

  // Save layout to backend
  const saveLayoutToBackend = async (newLayout) => {
    try {
      await fetch(`${API_BASE_URL}/api/user/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statisticsLayout: newLayout })
      });
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  const { layout, handleMouseDown } = useDraggableRows(initialLayout, saveLayoutToBackend);

  // Card data mapping - memoized to prevent unnecessary re-renders
  const cardData = useMemo(() => [
    {
      id: 0,
      title: "Total Revenue",
      value: statistics.totalRevenue.value,
      change: statistics.totalRevenue.change,
      className: "yellow",
      format: "currency",
      flexGrow: 1
    },
    {
      id: 1,
      title: "Products Sold",
      value: statistics.productsSold.value,
      change: statistics.productsSold.change,
      className: "teal",
      format: "number",
      flexGrow: 1
    },
    {
      id: 2,
      title: "Products In Stock",
      value: statistics.productsInStock.value,
      change: statistics.productsInStock.change,
      className: isMobile ? "purple" : "pink",
      format: "number",
      flexGrow: 1
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
  ], [statistics, isMobile]); // Only re-compute when statistics or isMobile changes

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    fetchStatistics();
  }, [token]);

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

  const renderCard = (cardId, rowType) => {
    const card = cardData.find(c => c.id === cardId);
    if (!card) return null;

    return (
      <div
        key={card.id}
        data-card-id={card.id}
        className={`draggable-card ${card.className}`}
        onMouseDown={(e) => handleMouseDown(e, card.id, rowType)}
        style={{ flexGrow: card.flexGrow, cursor: isMobile ? 'default' : 'grab' }}
      >
        {card.component ? card.component : (
          <div className={`card-statistics ${card.className}`}>
            <p>{card.title}</p>
            <h2>
              {card.format === 'currency' 
                ? formatCurrency(card.value)
                : card.value.toLocaleString()
              }
            </h2>
            <span>{formatPercentage(card.change)}</span>
          </div>
        )}
      </div>
    );
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

        <main className="content-statistics">
          {isMobile ? (
            <>
              <div className="mobile-chart-section">
                <div className="statistics-graph-card">
                  <SalesPurchaseChart chartData={statistics.chartData} />
                  <CustomLegend />
                </div>
              </div>
              
              <div className="mobile-cards-statistics">
                {cardData.slice(0, 3).map(card => (
                  <div key={card.id} className={`card-statistics ${card.className}`}>
                    <p>{card.title}</p>
                    <h2>
                      {card.format === 'currency' 
                        ? formatCurrency(card.value)
                        : card.value.toLocaleString()
                      }
                    </h2>
                    <span>{formatPercentage(card.change)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Only render desktop layout when both loading and layoutLoading are false
            !loading && !layoutLoading ? (
              <>
                <div className="cards-statistics draggable-row" data-row-type="firstRow">
                  {layout.firstRow.map(cardId => renderCard(cardId, 'firstRow'))}
                </div>

                <div 
                  className="charts-section draggable-row" 
                  data-row-type="secondRow"
                >
                  {layout.secondRow.map(cardId => renderCard(cardId, 'secondRow'))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'white' }}>
                Loading statistics...
              </div>
            )
          )}

        </main>
      </div>
      
      {/* Mobile Bottom Navigation - only show on mobile */}
      {isMobile && <BottomNav />}
    </div>
  )
}