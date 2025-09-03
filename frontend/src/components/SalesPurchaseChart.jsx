import React, { useRef, useState, useEffect } from "react";
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
import "../css/SalesPurchaseChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesPurchaseChart({ chartData = [] }) {
    const chartRef = useRef(null);
    const [filter, setFilter] = useState("Monthly");
    const [chartHeight, setChartHeight] = useState(320);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Calculate responsive height based on screen size
    useEffect(() => {
        const updateChartHeight = () => {
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;
            
            let height;
            
            // Tablet and mobile (width <= 1024px)
            if (screenWidth <= 768) {
                // Mobile
                height = Math.min(screenHeight * 0.35, 280);
            } else if (screenWidth <= 1024) {
                // Tablet
                height = Math.min(screenHeight * 0.4, 320);
            } else if (screenWidth <= 1440) {
                // Small desktop
                height = Math.min(screenHeight * 0.45, 360);
            } else {
                // Large desktop
                height = Math.min(screenHeight * 0.5, 400);
            }
            
            setChartHeight(height);
        };

        updateChartHeight();
        window.addEventListener('resize', updateChartHeight);

        return () => window.removeEventListener('resize', updateChartHeight);
    }, []);

    const getGradient = (ctx, colorStops) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        colorStops.forEach(([offset, color]) => {
            gradient.addColorStop(offset, color);
        });
        return gradient;
    };

    const barGap = 0.6;

    // Generate dynamic data for Weekly and Yearly periods
    const generateWeeklyData = () => {
        const today = new Date();
        const weekData = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Get current week's Monday
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            
            // Generate some sample data based on day pattern
            const baseValue = 3000 + (i * 200);
            const variance = Math.random() * 1000;
            const purchase = Math.round(baseValue + variance);
            const sales = Math.round(purchase * 0.85 + Math.random() * 500);
            
            weekData.push({
                day: days[i],
                purchase,
                sales
            });
        }
        
        return weekData;
    };

    const generateYearlyData = () => {
        const currentYear = new Date().getFullYear();
        const yearData = [];
        
        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i;
            
            // Generate data based on year growth pattern
            const baseValue = 300000 + (i * 50000);
            const variance = Math.random() * 100000;
            const purchase = Math.round(baseValue + variance);
            const sales = Math.round(purchase * 0.9 + Math.random() * 50000);
            
            yearData.push({
                year: year.toString(),
                purchase,
                sales
            });
        }
        
        return yearData;
    };

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
            const weeklyData = generateWeeklyData();
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
            const yearlyData = generateYearlyData();
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
        // Get maximum value from all datasets
        let maxValue = 0;
        data.datasets.forEach(dataset => {
            const datasetMax = Math.max(...dataset.data);
            if (datasetMax > maxValue) maxValue = datasetMax;
        });

        // If max is 0, return 50 as minimum
        if (maxValue === 0) return 50;

        // Determine appropriate scale based on data size
        let stepSize, maxTicks;
        
        if (maxValue <= 50) {
            stepSize = 10;
            maxTicks = 6; // 0, 10, 20, 30, 40, 50
        } else if (maxValue <= 500) {
            stepSize = 100;
            maxTicks = 6; // 0, 100, 200, 300, 400, 500
        } else if (maxValue <= 5000) {
            stepSize = 1000;
            maxTicks = 6; // 0, 1K, 2K, 3K, 4K, 5K
        } else if (maxValue <= 50000) {
            stepSize = 10000;
            maxTicks = 6; // 0, 10K, 20K, 30K, 40K, 50K
        } else {
            stepSize = 100000;
            maxTicks = 6; // 0, 100K, 200K, 300K, 400K, 500K
        }

        // Calculate max that accommodates all data
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
                        // Enable pointer events for dropdown when hover
                        e.currentTarget.style.pointerEvents = "all";
                        e.currentTarget.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                        // Keep pointer events enabled
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
                            // Prevent drag behavior when clicking dropdown
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            // Prevent drag behavior when clicking dropdown
                            e.stopPropagation();
                        }}
                    >
                        <option value="Weekly" style={{ alignItems: 'start'}}>Weekly</option>
                        <option value="Monthly" style={{ alignItems: 'start'}}>Monthly</option>
                        <option value="Yearly" style={{ alignItems: 'start'}}>Yearly</option>
                    </select>
                </div>
            </div>
            <div style={{ height: `${chartHeight}px`, width: '100%' }}>
                <Bar ref={chartRef} data={getChartData()} options={options} />
            </div>
        </div>
    );
}
