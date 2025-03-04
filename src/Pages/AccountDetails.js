import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/AccountDetails.css";
import api from "../api";
import EditTransactionModal from "../Components/EditTransactionModal"; // ✅ Adjust the path if necessary
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct way to import


const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [broughtForward, setBroughtForward] = useState(0);
  const [carriedForward, setCarriedForward] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split("T")[0]);


  const formatDate = (dateString) => {
    return dateString.split("T")[0]; // ✅ Returns only YYYY-MM-DD
  }; 

  // ✅ Default transaction state with today's date
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    debit: "",
    credit: "",
    details: ""
  });

  // ✅ Fetch Account Details & Transactions Once
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const accounts = await api.getAccounts();
        const selectedAccount = accounts.find(acc => acc.id === parseInt(id));
        if (selectedAccount) {
          setAccount(selectedAccount);
        }

        // ✅ Fetch transactions to determine previous day's Balance Carried Forward
        const transactionData = await api.getTransactions(id);
        setTransactions(transactionData);

        if (transactionData.length > 0) {
          transactionData.sort((a, b) => new Date(a.date) - new Date(b.date));
          const today = new Date().toISOString().split("T")[0];
          const lastTransaction = transactionData
            .filter(txn => txn.date < today)
            .pop();

          if (lastTransaction) {
            const totalDebits = transactionData.reduce((acc, txn) => acc + (txn.debit ? parseFloat(txn.debit) : 0), 0);
            const totalCredits = transactionData.reduce((acc, txn) => acc + (txn.credit ? parseFloat(txn.credit) : 0), 0);
            setBroughtForward(parseFloat(totalDebits - totalCredits).toFixed(2));
          } else {
            setBroughtForward(0);
          }
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };

    fetchAccountData();
  }, [id]);

  // ✅ Calculate Totals & Update Balance Carried Forward Dynamically
  useEffect(() => {
    const debits = transactions.reduce((acc, txn) => acc + (txn.debit ? parseFloat(txn.debit) : 0), 0);
    const credits = transactions.reduce((acc, txn) => acc + (txn.credit ? parseFloat(txn.credit) : 0), 0);

    setTotalDebits(debits);
    setTotalCredits(credits);

    // ✅ Correct formula: Balance Carried Forward = (Total Debits - Total Credits)
    setCarriedForward(parseFloat(debits - credits).toFixed(2));
  }, [transactions]);


  
  // ✅ Handle Adding Transactions
  const handleAddTransaction = async () => {
    if (!newTransaction.date) {
      setError("Please select a date.");
      return;
    }

    if (!newTransaction.debit && !newTransaction.credit) {
      setError("Please enter either a debit or a credit amount.");
      return;
    }


    const transactionData = {
      date: newTransaction.date,
      debit: newTransaction.debit ? parseFloat(newTransaction.debit) : 0,
      credit: newTransaction.credit ? parseFloat(newTransaction.credit) : 0,
      details: newTransaction.details.trim(),
    };

    try {
      const result = await api.addTransaction(id, transactionData);
      if (result) {
        setTransactions([...transactions, result]);
        setNewTransaction({ 
          date: new Date().toISOString().split("T")[0], // ✅ Reset date to today
          debit: "", 
          credit: "", 
          details: "" 
        });
      } else {
        setError("Transaction failed.");
      }
    } catch (error) {
      setError("Server error. Try again.");
      console.error("Error adding transaction:", error);
    }
  };

  // ✅ Handle Editing Transactions
  const handleEditTransaction = async () => {
    if (!editingTransaction) return;
  
    if (!editingTransaction.debit && !editingTransaction.credit && !editingTransaction.details) {
      setError("Please update either the amount (debit/credit) or the details.");
      return;
    }
  
    try {
      const transactionUpdate = {
        date: editingTransaction.date, // ✅ Keep the existing date
        debit: editingTransaction.debit ? parseFloat(editingTransaction.debit) : 0,
        credit: editingTransaction.credit ? parseFloat(editingTransaction.credit) : 0,
        details: editingTransaction.details ? editingTransaction.details.trim() : "",
      };
  
      const result = await api.editTransaction(editingTransaction.id, transactionUpdate); // ✅ Backend API call
  
      if (result) {
        setTransactions(transactions.map(txn => txn.id === result.id ? result : txn));
        setEditingTransaction(null); // ✅ Close modal after saving
      }
    } catch (error) {
      setError("Server error. Try again.");
      console.error("Error editing transaction:", error);
    }
  };
  
  
  // ✅ Handle Deleting Transactions
  const handleDeleteTransaction = async (transactionId) => {
    try {
      const success = await api.deleteTransaction(transactionId);
      if (success) {
        setTransactions(transactions.filter(txn => txn.id !== transactionId));
      } else {
        setError("Failed to delete transaction.");
      }
    } catch (error) {
      setError("Server error. Try again.");
      console.error("Error deleting transaction:", error);
    }
  };

  const generateReport = () => {
    if (transactions.length === 0) {
      alert("No transactions available for this account.");
      return;
    }
  
    console.log("Selected Report Period:", reportStartDate, "to", reportEndDate); // ✅ Debugging log
    console.log("All Transactions:", transactions); // ✅ Log all transactions before filtering
  
    const filteredTransactions = transactions.filter(txn => {
      return formatDate(txn.date) >= reportStartDate && formatDate(txn.date) <= reportEndDate;
    });
    
  
    console.log("Filtered Transactions:", filteredTransactions); // ✅ Log transactions after filtering
  
    if (filteredTransactions.length === 0) {
      alert("No transactions found for the selected period.");
      return;
    }
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Account Report: ${account.name}`, 10, 10);
  
    // ✅ Draw horizontal line
    doc.setLineWidth(0.5);
    doc.line(10, 15, 200, 15); // Draws a line below the title
  
    doc.setFontSize(12);
    const startDate = formatDate(transactions[0].date);
    const endDate = formatDate(transactions[transactions.length - 1].date);
    
  
    doc.text(`Report Period: ${startDate} to ${endDate}`, 10, 25);
    doc.text(`Balance Brought Forward: $${Math.abs(broughtForward).toLocaleString()} (${broughtForward >= 0 ? "Debit" : "Credit"})`, 10, 35);
    doc.text(`Balance Carried Forward: $${Math.abs(carriedForward).toLocaleString()} (${carriedForward >= 0 ? "Debit" : "Credit"})`, 10, 45);
    doc.text(`Total Debits: $${totalDebits.toLocaleString()}`, 10, 55); // ✅ New header
    doc.text(`Total Credits: $${totalCredits.toLocaleString()}`, 10, 65); // ✅ New header
    
  
    // ✅ Draw another horizontal line
    doc.line(10, 50, 200, 50);
  
    // ✅ Prepare transaction data for the table
    const tableData = transactions.map((txn) => [
      formatDate(txn.date),
      txn.debit ? `$${txn.debit.toLocaleString()}` : "-",
      txn.credit ? `$${txn.credit.toLocaleString()}` : "-",
      txn.details
    ]);
  
    // ✅ Add totals row
    tableData.push([
      "TOTALS",
      `$${totalDebits.toLocaleString()}`,
      `$${totalCredits.toLocaleString()}`,
      "",
    ]);
  
    // ✅ Render the table with autoTable
    autoTable(doc, {
      head: [["Date", "Debits ($)", "Credits ($)", "Details"]],
      body: tableData,
      startY: 75,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" }, // Blue header
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray background for alternating rows
      tableLineColor: 200,
      tableLineWidth: 0.1,
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 10, doc.internal.pageSize.height - 15);
      }
    });
  
    doc.save(`Account_Report_${account.name}.pdf`);
  };
  
  
  return (
    
    <div className="account-details">
      <EditTransactionModal 
  editingTransaction={editingTransaction} 
  setEditingTransaction={setEditingTransaction} 
  handleEditTransaction={handleEditTransaction} 
/>
{/* ✅ Report Modal */}
{showReportModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Select Report Period</h3>

      <label>Start Date:</label>
      <input 
        type="date" 
        value={reportStartDate} 
        onChange={(e) => setReportStartDate(e.target.value)}
      />

      <label>End Date:</label>
      <input 
        type="date" 
        value={reportEndDate} 
        onChange={(e) => setReportEndDate(e.target.value)}
      />

      <div className="modal-buttons">
      <button className="generate-btn" onClick={generateReport}>Generate Report</button>
        <button className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      <h2>{account?.name}</h2>
      <p>
        <strong>Balance Brought Forward:</strong> ${Math.abs(broughtForward).toLocaleString()} 
        <span className={broughtForward >= 0 ? "debit-text" : "credit-text"}>
          ({broughtForward >= 0 ? "Debit Balance" : "Credit Balance"})
        </span>
      </p>
      <div className="account-actions">
  <button className="back-btn" onClick={() => navigate("/accounts")}>← Back to Accounts</button>
  <button className="report-btn" onClick={() => setShowReportModal(true)}>📄 Generate Report</button>
</div>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Debits ($)</th>
            <th>Credits ($)</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>{txn.date ? formatDate(txn.date) : "-"}</td>
              <td>{txn.debit ? `$${txn.debit.toLocaleString()}` : "-"}</td>
              <td>{txn.credit ? `$${txn.credit.toLocaleString()}` : "-"}</td>
              <td>{txn.details}</td>
              <td>
  <div className="action-buttons">
    <button className="edit-btn" onClick={(e) => { 
      e.stopPropagation();
      console.log("Editing Transaction:", txn); // ✅ Debugging Output
      setEditingTransaction({ ...txn }); // ✅ Ensures the transaction state is set properly
    }}>
      Edit
    </button>
    <button className="delete-btn" onClick={() => handleDeleteTransaction(txn.id)}>
      Delete
    </button>
  </div>
</td>
            </tr>
          ))}
<tr className="totals-row">
  <td><strong>Totals:</strong></td>
  <td><strong>${totalDebits.toLocaleString()}</strong></td>
  <td><strong>${totalCredits.toLocaleString()}</strong></td>
  <td></td>
</tr>

{/* ✅ Balance Carried Forward Row */}
<tr className="balance-row">
  <td><strong>Balance Carried Forward:</strong></td>
  <td>{carriedForward > 0 ? <strong>${carriedForward.toLocaleString()}</strong> : "-"}</td>
  <td>{carriedForward < 0 ? <strong>${Math.abs(carriedForward).toLocaleString()}</strong> : "-"}</td>
  <td></td>
</tr>
        </tbody>
      </table>
      {/* ✅ Add New Transaction Form */}
<div className="new-transaction">
  <h3>Add New Transaction</h3>
  {error && <p className="error-message">{error}</p>}

  <input 
    type="date" 
    value={newTransaction.date} 
    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
  />
  
  <input 
    type="number" 
    placeholder="Debit ($)" 
    value={newTransaction.debit} 
    onChange={(e) => setNewTransaction({ ...newTransaction, debit: e.target.value, credit: "" })} 
  />

  <input 
    type="number" 
    placeholder="Credit ($)" 
    value={newTransaction.credit} 
    onChange={(e) => setNewTransaction({ ...newTransaction, credit: e.target.value, debit: "" })} 
  />

  <input 
    type="text" 
    placeholder="Details" 
    value={newTransaction.details} 
    onChange={(e) => setNewTransaction({ ...newTransaction, details: e.target.value })} 
  />

  <button onClick={handleAddTransaction}>Submit</button>
  <button className="cancel-btn" onClick={() => setNewTransaction({ date: new Date().toISOString().split("T")[0], debit: "", credit: "", details: "" })}>
    Cancel
  </button>
</div>

    </div>
  );
};

export default AccountDetails;
