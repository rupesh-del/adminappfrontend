import React from "react";
import { useNavigate } from "react-router-dom";

const GoalTracker = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Goal Tracker</h2>
      <button onClick={() => navigate("/daily-reports")}>⬅ Back to Reports</button>
      <p>Track your business goals here.</p>
    </div>
  );
};

export default GoalTracker;
