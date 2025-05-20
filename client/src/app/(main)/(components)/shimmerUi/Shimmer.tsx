import React from "react";
import "./Shimmer.css";

const Shimmer = () => {
  return (
    <div className="shimmer-layout">
      <div className="shimmer-sidebar">
        <div className="shimmer-sidebar-item"></div>
        <div className="shimmer-sidebar-item"></div>
        <div className="shimmer-sidebar-item"></div>
      </div>

      <div className="shimmer-main">
        <div className="shimmer-header"></div>

        <div className="shimmer-cards">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="shimmer-card"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
