import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import api from "../api"; // Ensure correct API import
import "../Styles/dailyreceivables.css"; // Ensure styles are linked
import NewReportModal from "../Components/NewReportModal"; // Import the modal component

const DailyReceivables = () => {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigate


  const handleViewReport = (reportDate) => {
    console.log("🟢 handleViewReport called with reportDate:", reportDate);

    // ✅ Convert to YYYY-MM-DD format before navigating
    const formattedDate = new Date(reportDate).toISOString().split("T")[0];
    
    console.log("📅 Formatted Date for navigation:", formattedDate);
    navigate(`/daily-receivables/${formattedDate}`);
};

const handleDeleteReport = async (reportDate) => {
  if (!window.confirm(`Are you sure you want to delete the report for ${reportDate}?`)) {
      return; // Cancel deletion if user clicks "No"
  }

  try {
      console.log(`🗑 Deleting Report: ${reportDate}`);
      const response = await api.deleteDailyReceivablesReport(reportDate);

      if (response.error) {
          console.error("❌ Delete failed:", response.error);
          alert("Failed to delete report. Please try again.");
          return;
      }

      // ✅ Remove the deleted report from state
      setReports((prevReports) => prevReports.filter(report => report.report_date !== reportDate));
      
      alert("✅ Report deleted successfully!");
  } catch (error) {
      console.error("❌ API Error:", error);
      alert("An error occurred while deleting the report.");
  }
};


  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      console.log("🔄 Fetching Reports...");
      const data = await api.getAllDailyReceivablesReports();
      
      // Ensure `customers` is always an array
      const updatedData = data.map(report => ({
        ...report,
        customers: Array.isArray(report.customers) ? report.customers : []
      }));
  
      setReports(updatedData);
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  };

  const handleEditReport = (reportDate) => {
    navigate(`/edit-report/${reportDate}`);
};

  return (
    <div className="daily-receivables-container">
      <h2 className="page-title">Daily Receivables</h2>

      <button className="back-to-reports-btn" onClick={() => navigate("/daily-reports")}>
                Back to Daily Reports
            </button>
      {/* New Report Button (Opens Modal) */}
      <button className="new-report-btn" onClick={() => setShowModal(true)}>
        New Report
      </button>

      {/* Reports Table */}
      <div className="reports-table">
        {reports.length === 0 ? (
          <p>No reports available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                            <tr key={index}>
                                {/* ✅ Clicking the row navigates to Edit Report */}
                                <td onClick={() => navigate(`/edit-report/${report.report_date}`)} style={{ cursor: "pointer" }}>
    {report.report_date.split("T")[0]}
</td>
                                <td>
                                    {/* ✅ "View" now correctly navigates to View Report */}
                                    <button className="view-btn" onClick={(e) => {
    e.stopPropagation(); // ✅ Prevents row click from triggering
    const formattedDate = new Date(report.report_date).toISOString().split("T")[0]; // ✅ Convert to YYYY-MM-DD format
    navigate(`/view-report/${formattedDate}`);
}}>
    View
</button>
                <button
                    className="delete-btn"
                    onClick={() => handleDeleteReport(report.report_date)}
                >
                    Delete
                </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Full-Screen Report Modal */}
      {showModal && <NewReportModal closeModal={() => setShowModal(false)} />}
    </div>
  );
};

export default DailyReceivables;
