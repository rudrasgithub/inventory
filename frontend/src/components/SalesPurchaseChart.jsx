import React, { useRef, useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { AuthContext } from '../Context/ContextProvider';
import "../css/SalesPurchaseChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesPurchaseChart({ chartData = [] }) {
    const { token } = useContext(AuthContext);
    const chartRef = useRef(null);
    const [filter, setFilter] = useState("Monthly");
    const [chartHeight, setChartHeight] = useState(320);
    const [weeklyData, setWeeklyData] = useState([]);
    const [yearlyData, setYearlyData] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

    // Debug: Log monthly chart data when it changes
    useEffect(() => {
        console.log('Monthly chartData prop received:', chartData);
    }, [chartData]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Calculate responsive height based on screen size
    useEffect(() => {
        const updateChartHeight = () => {
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;
            
            let height;
            
            if (screenWidth <= 768) {
                height = Math.min(screenHeight * 0.35, 280);
            } else if (screenWidth <= 1024) {
                height = Math.min(screenHeight * 0.4, 320);
            } else if (screenWidth <= 1440) {
                height = Math.min(screenHeight * 0.45, 360);
            } else {
                height = Math.min(screenHeight * 0.5, 400);
            }
            
            setChartHeight(height);
        };

        updateChartHeight();
        window.addEventListener('resize', updateChartHeight);

        return () => window.removeEventListener('resize', updateChartHeight);
    }, []);

    // Fetch weekly data from backend
    const fetchWeeklyData = async () => {
        setLoading(true);
        try {
            console.log('Fetching weekly data...');
            const response = await fetch(`${API_BASE_URL}/api/statistics/weekly`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Weekly data received:', data);
                setWeeklyData(data.weeklyData || []);
            } else {
                console.error('Failed to fetch weekly data');
                setWeeklyData([]);
            }
        } catch (error) {
            console.error('Error fetching weekly data:', error);
            setWeeklyData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch yearly data from backend
    const fetchYearlyData = async () => {
        setLoading(true);
        try {
            console.log('Fetching yearly data...');
            const response = await fetch(`${API_BASE_URL}/api/statistics/yearly`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Yearly data received:', data);
                setYearlyData(data.yearlyData || []);
            } else {
                console.error('Failed to fetch yearly data');
                setYearlyData([]);
            }
        } catch (error) {
            console.error('Error fetching yearly data:', error);
            setYearlyData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when filter changes
    useEffect(() => {
        if (filter === "Weekly" && token) {
            fetchWeeklyData();
        } else if (filter === "Yearly" && token) {
            fetchYearlyData();
        }
    }, [filter, token]);

    const getGradient = (ctx, colorStops) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        colorStops.forEach(([offset, color]) => {
            gradient.addColorStop(offset, color);
        });
        return gradient;
    };

    const barGap = 0.6;

    // Use dynamic chart data based on filter
    const getChartData = () => {
        let data = { labels: [], datasets: [] };

        if (filter === "Monthly") {
            if (chartData && chartData.length > 0) {
                data = {
                    labels: chartData.map(item => item.month),
                    datasets: [
                        {
                            label: "Purchase",
                            data: chartData.map(item => item.purchase),
                        },
                        {
                            label: "Sales",
                            data: chartData.map(item => item.sales),
                        }
                    ]
                };
            }
        } else if (filter === "Weekly") {
            data = {
                labels: weeklyData.map(item => item.day),
                datasets: [
                    {
                        label: "Purchase",
                        data: weeklyData.map(item => item.purchase),
                    },
                    {
                        label: "Sales",
                        data: weeklyData.map(item => item.sales),
                    }
                ]
            };
        } else if (filter === "Yearly") {
            data = {
                labels: yearlyData.map(item => item.year),
                datasets: [
                    {
                        label: "Purchase",
                        data: yearlyData.map(item => item.purchase),
                    },
                    {
                        label: "Sales",
                        data: yearlyData.map(item => item.sales),
                    }
                ]
            };
        }

        // Add styling to datasets
        data.datasets.forEach((dataset, index) => {
            const isPurchase = dataset.label === "Purchase";
            dataset.backgroundColor = (context) => {
                const ctx = context.chart.ctx;
                const colors = isPurchase 
                    ? ["#817AF3", "#74B0FA", "#79D0F1"] 
                    : ["#46A46C", "#51CC5D", "#57DA65"];
                return getGradient(ctx, [[1, colors[0]], [0.48, colors[1]], [0, colors[2]]]);
            };
            dataset.borderWidth = 0;
            dataset.borderRadius = 5;
            dataset.categoryPercentage = 0.5;
            dataset.barPercentage = barGap;
        });

        return data;
    };

    // Smart Y-axis scaling function
    const calculateYAxisMax = (data) => {
        let maxValue = 0;
        
        // Handle case where data or datasets might be empty
        if (!data || !data.datasets || data.datasets.length === 0) {
            return { stepSize: 10, suggestedMax: 50, maxTicks: 6 };
        }
        
        data.datasets.forEach(dataset => {
            if (dataset.data && dataset.data.length > 0) {
                const datasetMax = Math.max(...dataset.data);
                if (datasetMax > maxValue) maxValue = datasetMax;
            }
        });

        if (maxValue === 0) return { stepSize: 10, suggestedMax: 50, maxTicks: 6 };

        let stepSize, maxTicks;
        
        if (maxValue <= 50) {
            stepSize = 10;
            maxTicks = 6;
        } else if (maxValue <= 500) {
            stepSize = 100;
            maxTicks = 6;
        } else if (maxValue <= 5000) {
            stepSize = 1000;
            maxTicks = 6;
        } else if (maxValue <= 50000) {
            stepSize = 10000;
            maxTicks = 6;
        } else {
            stepSize = 100000;
            maxTicks = 6;
        }

        const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize;
        return { stepSize, suggestedMax, maxTicks };
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                stacked: false,
            },
            y: {
                grid: {
                    drawBorder: true,
                    display: true
                },
                ticks: {
                    callback: function(value) {
                        if (value >= 1000) {
                            return (value / 1000) + 'K';
                        }
                        return value;
                    },
                    stepSize: function() {
                        const { stepSize } = calculateYAxisMax(getChartData());
                        return stepSize;
                    }(),
                    maxTicksLimit: function() {
                        const { maxTicks } = calculateYAxisMax(getChartData());
                        return maxTicks;
                    }()
                },
                suggestedMin: 0,
                suggestedMax: function() {
                    const { suggestedMax } = calculateYAxisMax(getChartData());
                    return suggestedMax;
                }()
            },
        },
    };

    return (
        <div className="chart-card-graph">
            <div className="chart-header-graph" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", height: "40px" }}>
                <h3 style={{ margin: 0 }}>Sales & Purchase</h3>
                <div 
                    className="dropdown-container" 
                    style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        height: "40px",
                        pointerEvents: "all",
                        zIndex: 10,
                        position: "relative"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.pointerEvents = "all";
                        e.currentTarget.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.pointerEvents = "all";
                    }}
                >
                    <select 
                        className="filter-dropdown" 
                        value={filter} 
                        onChange={handleFilterChange} 
                        style={{ 
                            backgroundImage: `url('/graph-period.svg')`, 
                            backgroundRepeat: "no-repeat", 
                            backgroundPosition: "left 7px center", 
                            backgroundSize: "20px 20px", 
                            paddingLeft: "35px",
                            pointerEvents: "all",
                            cursor: "pointer",
                            zIndex: 20,
                            position: "relative"
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>
            </div>
            <div style={{ height: `${chartHeight}px`, width: '100%', position: 'relative' }}>
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        color: '#666'
                    }}>
                        Loading {filter.toLowerCase()} data...
                    </div>
                ) : (
                    <Bar ref={chartRef} data={getChartData()} options={options} />
                )}
            </div>
        </div>
    );
}
