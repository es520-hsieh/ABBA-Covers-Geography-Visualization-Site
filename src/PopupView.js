import React from "react";
import "./PopupView.css";

const PopupView = ({ onClose }) => {
  return (
    <div className="popup-container">
      <div className="popup-body">
        <button className="close-button" onClick={onClose}>Close</button>
        <h2>Information</h2>
        <h3>DEMO</h3>
        <h3>Background</h3>
        <h3>Learning Objective</h3>
        <h3>Team</h3>
      </div>
    </div>
  );
};

export default PopupView;
