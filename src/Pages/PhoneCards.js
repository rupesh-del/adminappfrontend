import React from "react";
import { useNavigate } from "react-router-dom";

const PhoneCards = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Phone Cards Report</h2>
      <button onClick={() => navigate("/daily-reports")}>⬅ Back to Reports</button>
      <p>Manage phone card transactions.</p>
    </div>
  );
};

export default PhoneCards;
