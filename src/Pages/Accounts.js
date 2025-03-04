import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "../Styles/Accounts.css";
import NewAccountModal from "./NewAccountModal";
import api from "../api";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigate

  // ✅ Fetch All Accounts from API
  // ✅ Fetch Accounts & Balance Carried Forward
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getAccounts();
        
        // ✅ Fetch balance for each account
        const updatedAccounts = await Promise.all(data.map(async (account) => {
          const transactions = await api.getTransactions(account.id);
          
          // Calculate Balance Carried Forward = (Debits - Credits)
          const totalDebits = transactions.reduce((acc, txn) => acc + (txn.debit ? parseFloat(txn.debit) : 0), 0);
          const totalCredits = transactions.reduce((acc, txn) => acc + (txn.credit ? parseFloat(txn.credit) : 0), 0);
          const balanceCarriedForward = parseFloat(totalDebits - totalCredits).toFixed(2);

          return {
            ...account,
            balance: balanceCarriedForward, // ✅ Use Balance Carried Forward
            balanceType: balanceCarriedForward >= 0 ? "Debit" : "Credit"
          };
        }));

        setAccounts(updatedAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  // ✅ Add New Account & Refresh List
  const addAccount = async (newAccount) => {
    try {
      const createdAccount = await api.createAccount(newAccount);
      if (createdAccount) {
        setAccounts(prevAccounts => [...prevAccounts, createdAccount]); // Update state dynamically
      }
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // ✅ Delete Account & Refresh List
  const deleteAccount = async (accountId) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        const success = await api.deleteAccount(accountId);
        if (success) {
          setAccounts(accounts.filter(account => account.id !== accountId)); // Remove deleted account
        } else {
          alert("Failed to delete account.");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  // ✅ Navigate to Account Details
  const goToAccountDetails = (accountId) => {
    navigate(`/accounts/${accountId}`); // ✅ Redirects to account details
  };

  return (
    <div className="accounts-container">
      <h2>Business Accounts</h2>
      <button className="new-account-btn" onClick={() => setModalOpen(true)}>
        + New Account
      </button>

      <div className="accounts-list">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div 
              key={account.id} 
              className="account-card" 
              onClick={() => goToAccountDetails(account.id)} // ✅ Click to navigate
            >
              <h3>{account.name}</h3>
              <p>
  Balance: ${Math.abs(account.balance).toLocaleString()} 
  <span className={account.balanceType === "Debit" ? "debit-text" : "credit-text"}>
    ({account.balanceType})
  </span>
</p>
              <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteAccount(account.id); }}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No accounts available. Add a new one!</p>
        )}
      </div>

      {isModalOpen && (
        <NewAccountModal closeModal={() => setModalOpen(false)} addAccount={addAccount} />
      )}
    </div>
  );
};

export default Accounts;
