import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ChequeTracker.css";
import NewChequeModal from "../Components/NewChequeModal";
import api from "../api";

const ChequeTracker = () => {
  // State for search input
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleSaveCheque = async (newCheque) => {
    console.log("Sending cheque to backend:", newCheque);
    
    const savedCheque = await api.createCheque(newCheque);
    
    if (savedCheque) {
      setCheques((prevCheques) => [...prevCheques, savedCheque]); // Append new cheque
      console.log("Cheque added to state:", savedCheque);
    } else {
      console.error("Error saving cheque");
    }
  };
  
  
// ✅ Define fetchCheques globally so it can be used anywhere
const fetchCheques = async () => {
  try {
    const data = await api.getCheques();
    console.log("Fetched cheques:", data); // Debugging
    setCheques(data);
  } catch (error) {
    console.error("Error fetching cheques:", error);
  }
};

// ✅ Fetch cheques on component mount
useEffect(() => {
  fetchCheques();
}, []);

  

  // Sample data for now (replace with real data later)
  const [cheques, setCheques] = useState([
  ]);  

  // Handle search
  const filteredCheques = cheques.filter((cheque) => {
    return (
      (cheque.number && cheque.number.includes(searchTerm)) ||
      (cheque.bank && cheque.bank.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cheque.payee && cheque.payee.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleStatusChange = async (chequeNumber, newStatus) => {
    if (!chequeNumber) {
      console.error("❌ Cheque number is missing!");
      return;
    }
  
    console.log(`🚀 Changing status of cheque ${chequeNumber} to: ${newStatus}`);
  
    const updatedCheque = await api.updateChequeStatus(chequeNumber, newStatus);
  
    if (updatedCheque) {
      // ✅ Update the local state immediately for instant feedback
      setCheques((prevCheques) =>
        prevCheques.map((cheque) =>
          cheque.cheque_number === chequeNumber ? { ...cheque, status: newStatus } : cheque
        )
      );
  
      // ✅ Fetch the latest data from the backend to keep it accurate
      fetchCheques();
    } else {
      alert("❌ Failed to update cheque status.");
    }
  };
 
  const getStatusColor = (status) => {
    switch (status) {
      case "Unpresented":
        return "blue";
      case "Deposited":
        return "yellow";
      case "Cleared":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "white"; // Default color
    }
  };
  

  return (
    <div className="cheque-tracker-container">
      <h2>Cheque Tracker</h2>

      {/* New Cheque Button */}
      <button className="new-cheque-btn" onClick={() => setIsModalOpen(true)}>New Cheque</button>
      {isModalOpen && <NewChequeModal onClose={() => setIsModalOpen(false)} onSave={handleSaveCheque} />}


      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Cheque Number, Bank, or Payee"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Cheque Data Table */}
      <table>
        <thead>
          <tr>
            <th>Cheque Number</th>
            <th>Bank Drawn</th>
            <th>Payer</th> {/* New Column */}
            <th>Payee</th>
            <th>Amount</th>
            <th>Admin Charge</th>
            <th>Net to Payee</th> {/* New Column */}
            <th>Date Posted</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
  {filteredCheques.length > 0 ? (
    filteredCheques.map((cheque, index) => (
      <tr 
        key={index} 
        className="clickable-row" 
        onClick={() => navigate(`/cheque-details/${cheque.cheque_number}`, { state: { cheque } })}
      >
        <td>{cheque.cheque_number}</td>
        <td>{cheque.bank_drawn || "N/A"}</td>
        <td>{cheque.payer}</td>
        <td>{cheque.payee}</td>
        <td>${(Number(cheque.amount) || 0).toFixed(2)}</td>
        <td>${(Number(cheque.admin_charge) || 0).toFixed(2)}</td>
        <td>${(Number(cheque.net_to_payee) || (Number(cheque.amount) - Number(cheque.admin_charge)) || 0).toFixed(2)}</td>
        <td>{cheque.date_posted ? new Date(cheque.date_posted).toLocaleDateString() : "N/A"}</td> {/* Fix for Date */}
        <td>
        <select
  value={cheque.status}
  onChange={(e) => handleStatusChange(cheque.cheque_number, e.target.value)}
  onClick={(e) => e.stopPropagation()} // Prevent row click
  style={{
    backgroundColor: getStatusColor(cheque.status),
    color: cheque.status === "Deposited" ? "black" : "white", // Ensure text is readable
    fontWeight: "bold",
    padding: "5px",
    borderRadius: "5px",
    border: "none",
  }}
>
  <option value="Unpresented" style={{ backgroundColor: "blue", color: "white" }}>Unpresented</option>
  <option value="Deposited" style={{ backgroundColor: "yellow", color: "black" }}>Deposited</option>
  <option value="Cleared" style={{ backgroundColor: "green", color: "white" }}>Cleared</option>
  <option value="Cancelled" style={{ backgroundColor: "red", color: "white" }}>Cancelled</option>
</select>

        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="9">No cheques found.</td>
    </tr>
  )}
</tbody>
      </table>
    </div>
  );
};

export default ChequeTracker;
