import React from "react";
import { useNavigate } from "react-router-dom";

const CashReport = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Cash Report</h2>
      <button onClick={() => navigate("/daily-reports")}>⬅ Back to Reports</button>
      <p>View daily cash transactions.</p>
    </div>
  );
};

export default CashReport;
