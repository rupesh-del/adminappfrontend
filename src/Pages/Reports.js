import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/dailyreports.css";

const DailyReports = () => {
  const navigate = useNavigate();

  const reports = [
    { name: "Daily Receivables", path: "/daily-receivables" },
    { name: "Goal Tracker", path: "/goal-tracker" },
    { name: "Cash Report", path: "/cash-report" },
    { name: "Phone Cards", path: "/phone-cards" },
  ];

  return (
    <div className="daily-reports-container">
      <h2 className="page-title">Daily Reports</h2>

      <div className="reports-grid">
        {reports.map((report, index) => (
          <div key={index} className="report-card" onClick={() => navigate(report.path)}>
            <h3>{report.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyReports;
