import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import "../css/Statistics.css";
import Sidebar from "./Sidebar";
import SalesPurchaseChart from "./SalesPurchaseChart";
import CustomLegend from "./CustomLegend";

export default function Statistics() {
  const { token } = useContext(AuthContext);
  const [statistics, setStatistics] = useState({
    totalRevenue: { value: 0, change: 0 },
    productsSold: { value: 0, change: 0 },
    productsInStock: { value: 0, change: 0 },
    chartData: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/statistics', {
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
    }
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

  return (
    <div className="statistics-dashboard">
      <Sidebar />

      <div className="statistics-main">
        <header className="statistics-header">
          <h1>Statistics</h1>
        </header>

        <main className="content-statistics">
          <div className="cards-statistics">
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
                <div className="card-statistics pink">
                  <p>Products In Stock</p>
                  <h2>{statistics.productsInStock.value.toLocaleString()}</h2>
                  <span>
                    {formatPercentage(statistics.productsInStock.change)}
                  </span>
                </div>
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

        </main>
      </div>
    </div>
  )
}
