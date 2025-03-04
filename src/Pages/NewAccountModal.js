import React, { useState } from "react";
import "../Styles/Accounts.css";
import api from "../api"; // ✅ Import API

const NewAccountModal = ({ closeModal, addAccount }) => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [balanceType, setBalanceType] = useState("debit"); // Default to Debit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !balance) {
      setError("Please fill in all fields.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    const newAccount = {
      name: name.trim(), // ✅ Trim to prevent duplicate entries due to spaces
      balance: balanceType === "debit" ? parseFloat(balance) : -parseFloat(balance),
      balanceType,
    };
  
    try {
      const createdAccount = await api.createAccount(newAccount);
      if (createdAccount) {
        addAccount(createdAccount); // ✅ Update UI
        closeModal();
      } else {
        setError("Failed to create account. It might already exist.");
      }
    } catch (error) {
      setError("Server error. Please try again.");
      console.error("Error creating account:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Account</h3>

        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          placeholder="Account Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Initial Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />

        <select
          value={balanceType}
          onChange={(e) => setBalanceType(e.target.value)}
          className="balance-type-select"
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <button onClick={handleSubmit} className="save-btn" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={closeModal} className="cancel-btn" disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NewAccountModal;
