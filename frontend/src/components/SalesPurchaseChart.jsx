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

    // Use dynamic chart data if available, otherwise use static data
    const getChartData = () => {
        if (chartData && chartData.length > 0 && filter === "Monthly") {
            return {
                labels: chartData.map(item => item.month),
                datasets: [
                    {
                        label: "Purchase",
                        data: chartData.map(item => item.purchase),
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            return getGradient(ctx, [
                                [1, "#817AF3"],
                                [0.48, "#74B0FA"],
                                [0, "#79D0F1"],
                            ]);
                        },
                        borderWidth: 0,
                        borderRadius: 5,
                        categoryPercentage: 0.5,
                        barPercentage: barGap,
                    },
                    {
                        label: "Sales",
                        data: chartData.map(item => item.sales),
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            return getGradient(ctx, [
                                [1, "#46A46C"],
                                [0.48, "#51CC5D"],
                                [0, "#57DA65"],
                            ]);
                        },
                        borderWidth: 0,
                        borderRadius: 5,
                        categoryPercentage: 0.5,
                        barPercentage: barGap,
                    },
                ],
            };
        }

        // Fallback to static data for Weekly/Yearly
        return {
            labels: filter === "Weekly" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : filter === "Monthly" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["2021", "2022", "2023", "2024", "2025"],
            datasets: [
                {
                    label: "Purchase",
                    data: filter === "Weekly" ? [4800, 5200, 3800, 3000, 3700, 2300, 2900] : filter === "Monthly" ? [48000, 52000, 38000, 30000, 37000, 23000, 29000, 24000, 37000, 26000, 31000, 40000] : [480000, 520000, 380000, 300000, 370000],
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        return getGradient(ctx, [
                            [1, "#817AF3"],
                            [0.48, "#74B0FA"],
                            [0, "#79D0F1"],
                        ]);
                    },
                    borderWidth: 0,
                    borderRadius: 5,
                    categoryPercentage: 0.5,
                    barPercentage: barGap,
                },
                {
                    label: "Sales",
                    data: filter === "Weekly" ? [4200, 4100, 4600, 3700, 4000, 3500, 2600] : filter === "Monthly" ? [42000, 41000, 46000, 37000, 40000, 35000, 26000, 22000, 38000, 31000, 29000, 45000] : [420000, 410000, 460000, 370000, 400000],
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        return getGradient(ctx, [
                            [1, "#46A46C"],
                            [0.48, "#51CC5D"],
                            [0, "#57DA65"],
                        ]);
                    },
                    borderWidth: 0,
                    borderRadius: 5,
                    categoryPercentage: 0.5,
                    barPercentage: barGap,
                },
            ],
        };
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
                    // Custom Y-axis scale with proper increments
                    callback: function(value) {
                        if (value >= 1000) {
                            return (value / 1000) + 'K';
                        }
                        return value;
                    },
                    stepSize: 5000, // 5K increments
                    maxTicksLimit: 8
                },
                suggestedMin: 0,
                suggestedMax: function() {
                    // Calculate max value from data and round up to nearest 5K
                    const allData = getChartData();
                    let maxValue = 0;
                    
                    allData.datasets.forEach(dataset => {
                        const datasetMax = Math.max(...dataset.data);
                        if (datasetMax > maxValue) maxValue = datasetMax;
                    });
                    
                    // Round up to nearest 5000
                    return Math.ceil(maxValue / 5000) * 5000;
                }()
            },
        },
    };

    return (
        <div className="chart-card-graph">
            <div className="chart-header-graph" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", height: "40px" }}>
                <h3 style={{ margin: 0 }}>Sales & Purchase</h3>
                <div className="dropdown-container" style={{ display: "flex", alignItems: "center", gap: "10px", height: "40px" }}>
                    <select className="filter-dropdown" value={filter} onChange={handleFilterChange} style={{ backgroundImage: `url('/graph-period.svg')`, backgroundRepeat: "no-repeat", backgroundPosition: "left 7px center", backgroundSize: "20px 20px", paddingLeft: "35px" }}>
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
