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
// Cheques endpoint//
  // ✅ Fetch All Cheques
  getCheques: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheques`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cheques:", error);
      return [];
    }
  },

  // ✅ Fetch a Single Cheque by Number
  getChequeByNumber: async (chequeNumber) => {
    try {
      console.log(`🚀 Fetching main cheque details for: ${chequeNumber}`);
      const response = await axios.get(`${API_BASE_URL}/cheques/${chequeNumber}`);
      console.log("✅ Main Cheque Details Received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching main cheque details:", error.response?.data || error.message);
      return null;
    }
  },  

  // ✅ Create a New Cheque
  createCheque: async (chequeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheques`, chequeData);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating cheque:", error.response?.data || error.message);
      return null;
    }
  },

  // ✅ Delete a Cheque
  deleteCheque: async (chequeNumber) => {
    try {
      await axios.delete(`${API_BASE_URL}/cheques/${chequeNumber}`);
      return true;
    } catch (error) {
      console.error("Error deleting cheque:", error);
      return false;
    }
  },

  // ✅ Save New Cheque Details
  saveChequeDetails: async (chequeNumber, details) => {
    try {
      // ✅ Ensure all fields are included (no empty values)
      for (const [key, value] of Object.entries(details)) {
        if (!value) {
          throw new Error(`Missing value for: ${key}`);
        }
      }

      console.log("🔹 Sending Data to Backend:", details); // ✅ Debug Log

      const response = await axios.post(
        `${API_BASE_URL}/cheques/${chequeNumber}/details`,
        details
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error saving cheque details:", error.response?.data || error.message);
      return null;
    }
  },

// ✅ Fetch Cheque Details After Refresh
getChequeDetails: async (chequeNumber) => {
  if (!chequeNumber) {
    console.error("❌ getChequeDetails called with undefined chequeNumber!");
    return null;
  }

  try {
    console.log(`🚀 Fetching cheque details for: ${chequeNumber}`);
    const response = await axios.get(`${API_BASE_URL}/cheques/${chequeNumber}/details`);
    console.log("✅ API Response:", response.data); // 🔍 Debugging step
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cheque details:", error.response?.data || error.message);
    return null;
  }
},

// ✅ Edit Cheque Details Dynamically
editChequeDetails: async (chequeNumber, updatedFields) => {
  try {
    if (!chequeNumber) {
      console.error("❌ editChequeDetails called with undefined chequeNumber!");
      return null;
    }

    console.log(`🚀 Sending updated cheque details for: ${chequeNumber}`, updatedFields);
    
    const response = await axios.patch(
      `${API_BASE_URL}/cheques/${chequeNumber}/details`,
      updatedFields
    );

    console.log("✅ Updated Cheque Details:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating cheque details:", error.response?.data || error.message);
    return null;
  }
},
// ✅ Update Cheque Status
updateChequeStatus: async (chequeNumber, status) => {
  try {
    console.log(`🚀 Updating cheque ${chequeNumber} status to: ${status}`);

    const response = await axios.patch(
      `${API_BASE_URL}/cheques/${chequeNumber}/status`,
      { status }
    );

    console.log("✅ Cheque Status Updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating cheque status:", error.response?.data || error.message);
    return null;
  }
},


};



export default api;
