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

// DAILY REPORT COMPONENT
// DAILY RECEIVABLES REPORT
  // ✅ Fetch All Reports (Dates Only)

  getAllDailyReceivablesReports: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-receivables`);
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error.response?.data || error.message);
      return { error: "Failed to fetch reports" };
    }
  },

  // ✅ Create a New Report
// ✅ Create or Update Report
createOrUpdateDailyReceivablesReport: async (reportData) => {
  try {
      const validData = {
          report_date: reportData.report_date || new Date().toISOString().split("T")[0],
          opening_balance: reportData.opening_balance ? parseFloat(reportData.opening_balance) : 0,
          closing_balance: reportData.closing_balance ? parseFloat(reportData.closing_balance) : 0,
          report_data: {
              customers: Array.isArray(reportData.customers) ? reportData.customers : [],
              digicel_wholesale: Array.isArray(reportData.digicel_wholesale) ? reportData.digicel_wholesale : [],
              misc_sales: Array.isArray(reportData.misc_sales) ? reportData.misc_sales : [],
              cash_payouts: Array.isArray(reportData.cash_payouts) ? reportData.cash_payouts : []
          }
      };

      console.log("📡 Checking if Report Exists:", validData.report_date);

      // ✅ Check if report already exists
      const existingReport = await axios.get(`${API_BASE_URL}/daily-receivables/${validData.report_date}`)
          .then(res => res.data)
          .catch(error => (error.response?.status === 404 ? null : null));

      if (existingReport) {
          console.log("✏️ Report Exists. Updating...");
          // ✅ Update the existing report
          const updatePayload = { ...validData, report_data: JSON.stringify(validData.report_data) };
          const response = await axios.put(`${API_BASE_URL}/daily-receivables/${validData.report_date}`, updatePayload);
          return response.data;
      }

      console.log("🆕 Creating New Report...");
      // ✅ Create a new report
      const createPayload = { ...validData, report_data: JSON.stringify(validData.report_data) };
      const response = await axios.post(`${API_BASE_URL}/daily-receivables`, createPayload);
      return response.data;

  } catch (error) {
      console.error("❌ Error saving report:", error.response?.data || error.message);
      return { error: "Failed to save report" };
  }
},


// ✅ Finish Report
finishDailyReceivablesReport: async (reportDate) => {
  try {
      console.log(`🚀 Finishing Report: ${reportDate}`);

      // ✅ Convert the date to match the database format (YYYY-MM-DD)
      const formattedDate = new Date(reportDate).toISOString().split("T")[0];

      const response = await axios.put(`${API_BASE_URL}/daily-receivables/finish/${formattedDate}`);
      return response.data;
  } catch (error) {
      console.error("❌ Error finishing report:", error.response?.data || error.message);
      return { error: "Failed to finish report" };
  }
},


  // ✅ Retrieve a Specific Report by Date
  getDailyReceivablesReportByDate: async (reportDate) => {
    try {
        console.log(`📡 Fetching Report from API: ${reportDate}`);

        const formattedDate = reportDate.split("T")[0]; // ✅ Convert to YYYY-MM-DD format

        const response = await axios.get(`${API_BASE_URL}/daily-receivables/${formattedDate}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching report:", error.response?.data || error.message);
        return { error: "Failed to fetch report" };
    }
},


  // ✅ Update an Existing Report
  updateDailyReceivablesReport: async (date, updatedReport) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/daily-receivables/${date}`, updatedReport);
      return response.data;
    } catch (error) {
      console.error("Error updating report:", error.response?.data || error.message);
      return { error: "Failed to update report" };
    }
  },

  // ✅ Delete a Report by Date
  deleteDailyReceivablesReport: async (reportDate) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/daily-receivables/${reportDate}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting report:", error.response?.data || error.message);
        return { error: "Failed to delete report" };
    }
},

// Daily Report
    // ✅ Fetch all reports
    getAllDailyReports: async () => {
      const response = await fetch(`${API_BASE_URL}/daily-reports`);
      return response.json();
  },

  // ✅ Fetch a specific report
  getDailyReport: async (date) => {
      const response = await fetch(`${API_BASE_URL}/daily-report/${date}`);
      return response.json();
  },

  // ✅ Create a new report
  createDailyReport: async (reportData) => {
      const response = await fetch(`${API_BASE_URL}/daily-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
      });
      return response.json();
  },

  // ✅ Update an existing report
  updateDailyReport: async (id, reportData) => {
      const response = await fetch(`${API_BASE_URL}/daily-report/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
      });
      return response.json();
  },

  // ✅ Delete a report
  deleteDailyReport: async (id) => {
      return fetch(`${API_BASE_URL}/daily-report/${id}`, { method: "DELETE" });
  },


};

export default api;
