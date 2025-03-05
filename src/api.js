import axios from "axios";

// Backend URL (Replace with Render URL)
const API_BASE_URL = "https://adminappbackend.onrender.com";

const api = {
  
  // ✅ Fetch All Accounts
  getAccounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`);
      return response.data;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return [];
    }
  },

  // ✅ Create New Account
  createAccount: async (accountData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts`, accountData);
      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);
      return null;
    }
  },

  // ✅ Delete Account
  deleteAccount: async (accountId) => {
    try {
      await axios.delete(`${API_BASE_URL}/accounts/${accountId}`);
      return true;
    } catch (error) {
      console.error("Error deleting account:", error);
      return false;
    }
  },

  // ✅ Fetch Transactions for an Account
  getTransactions: async (accountId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}/transactions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  },

  // ✅ Add Transaction
  addTransaction: async (accountId, transactionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/${accountId}/transactions`, transactionData);
      return response.data;
    } catch (error) {
      console.error("Error adding transaction:", error);
      return null;
    }
  },

  // ✅ Edit Transaction
  editTransaction: async (transactionId, transactionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      console.error("Error editing transaction:", error);
      return null;
    }
  },

  // ✅ Delete Transaction
  deleteTransaction: async (transactionId) => {
    try {
      await axios.delete(`${API_BASE_URL}/transactions/${transactionId}`);
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
  },

};

export default api;
