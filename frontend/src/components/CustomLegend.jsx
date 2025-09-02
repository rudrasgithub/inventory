import React from "react";

const CustomLegend = () => {
    return (
        <div className="legend" style={{ display: "flex", justifyContent: "flex-start", gap: "20px", marginTop: "10px" }}>
            <div className="legend-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="legend-dot" style={{ backgroundColor: "#74B0FA", width: "15px", height: "15px", borderRadius: "50%" }} />
                <span style={{ marginLeft: "5px" }}>Purchase</span>
            </div>
            <div className="legend-item" style={{ display: "flex", alignItems: "center" }}>
                <span className="legend-dot" style={{ backgroundColor: "#46A46C", width: "15px", height: "15px", borderRadius: "50%" }} />
                <span style={{ marginLeft: "5px" }}>Sales</span>
            </div>
        </div>
    );
};

export default CustomLegend;