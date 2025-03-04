import React, { useState, useEffect } from "react";
import "../Styles/newreportmodal.css";
import api from "../api"; // Ensure API functions are imported

const NewReportModal = ({ closeModal }) => {
  const [reportData, setReportData] = useState({
    report_date: new Date().toISOString().split("T")[0],
    opening_balance: "",
    closing_balance: "",
    customers: [{}],
    digicel_wholesale: [{}],
    misc_sales: [{}],
    cash_payouts: [{}],
  });

  useEffect(() => {
    const autoSave = setTimeout(async () => {
        console.log("💾 Auto-Saving Report Data...");
        await api.createOrUpdateDailyReceivablesReport(reportData);
    }, 5000); // Delay auto-save

    return () => clearTimeout(autoSave); // Cleanup on re-render
}, [reportData]); // Runs when reportData changes

  const [isFinished, setIsFinished] = useState(false);
    // Check report status when loading
useEffect(() => {
  async function checkReportStatus() {
      const report = await api.getDailyReceivablesReportByDate(reportData.report_date);
      if (report && report.status === "finished") {
          setIsFinished(true);
      }
  }
  checkReportStatus();
}, []);

// ✅ Handle "Finish Report" Click
const handleFinishReport = async () => {
  const response = await api.finishDailyReceivablesReport(reportData.report_date);
  if (!response.error) {
      setIsFinished(true);
  }
};

  // ✅ Handle Input Changes
  const handleInputChange = (e, section, index, field) => {
    const value = e.target.value;
    setReportData((prevData) => {
      const updatedSection = [...prevData[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      return { ...prevData, [section]: updatedSection };
    });
  };

  // ✅ Handle Adding Rows
  const addRow = (section) => {
    setReportData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], {}],
    }));
  };

  // ✅ Handle Report Submission (Auto-Saves)
  const handleSubmit = async () => {
    const reportToSend = {
        ...reportData,
        opening_balance: reportData.opening_balance ? parseFloat(reportData.opening_balance) : 0,
        closing_balance: reportData.closing_balance ? parseFloat(reportData.closing_balance) : 0,
        report_data: reportData.report_data || {},
    };

    console.log("📤 Sending Report Data:", reportToSend);
    await api.createOrUpdateDailyReceivablesReport(reportToSend);
};


// ✅ Function to Calculate Column Totals
const calculateTotals = () => {
  return {
    digicel: reportData.customers.reduce((sum, c) => sum + (Number(c.digicel) || 0), 0),
    gtt: reportData.customers.reduce((sum, c) => sum + (Number(c.gtt) || 0), 0),
    mmg: reportData.customers.reduce((sum, c) => sum + (Number(c.mmg) || 0), 0),
    prepaid: reportData.customers.reduce((sum, c) => sum + (Number(c.prepaid) || 0), 0),
    other_credit: reportData.customers.reduce((sum, c) => sum + (Number(c.other_credit) || 0), 0),
    accounts_paid: reportData.customers.reduce((sum, c) => sum + (Number(c.accounts_paid) || 0), 0),
    net: reportData.customers.reduce((sum, c) =>
      sum +
      (Number(c.digicel) || 0) +
      (Number(c.gtt) || 0) +
      (Number(c.mmg) || 0) +
      (Number(c.prepaid) || 0) +
      (Number(c.other_credit) || 0) -
      (Number(c.accounts_paid) || 0), 0),

    // Subform Totals
    digicel_wholesale: reportData.digicel_wholesale.reduce((sum, w) => sum + (Number(w.amount) || 0), 0),
    misc_sales: reportData.misc_sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0),
    cash_payouts: reportData.cash_payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
  };
};

  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Daily Receivables Report</h2>

        {/* Report Date */}
        <label>Date:</label>
        <input type="date" value={reportData.report_date} disabled />

        {/* Opening & Closing Balance */}
        <label>Opening Balance:</label>
<input
  type="number"
  value={reportData.opening_balance || ""}
  onChange={(e) => setReportData({ ...reportData, opening_balance: e.target.value })}
/>

<label>Closing Balance:</label>
<input
  type="number"
  value={reportData.closing_balance || ""}
  onChange={(e) => setReportData({ ...reportData, closing_balance: e.target.value })}
/>

        {/* Customers Table */}
        <h3>Receivables Sheet</h3>
        <table>
  <thead>
    <tr>
      <th>Customer</th>
      <th>Digicel</th>
      <th>GTT</th>
      <th>MMG</th>
      <th>Prepaid</th>
      <th>Other Credit</th>
      <th>Accounts Paid</th>
      <th>Net</th>
    </tr>
  </thead>
  <tbody>
    {reportData.customers.map((customer, index) => (
      <tr key={index}>
        <td><input type="text" onChange={(e) => handleInputChange(e, "customers", index, "name")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "digicel")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "gtt")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "mmg")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "prepaid")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "other_credit")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "customers", index, "accounts_paid")} /></td>
        <td classname= "net-column">
          {(
            (Number(customer.digicel) || 0) +
            (Number(customer.gtt) || 0) +
            (Number(customer.mmg) || 0) +
            (Number(customer.prepaid) || 0) +
            (Number(customer.other_credit) || 0) -
            (Number(customer.accounts_paid) || 0)
          ).toLocaleString()}
        </td>
      </tr>
    ))}

    {/* ✅ Totals Row Below All Entries */}
    <tr className="totals-row">
      <td><strong>Totals</strong></td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.digicel || 0), 0).toLocaleString()}</td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.gtt || 0), 0).toLocaleString()}</td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.mmg || 0), 0).toLocaleString()}</td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.prepaid || 0), 0).toLocaleString()}</td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.other_credit || 0), 0).toLocaleString()}</td>
      <td>{reportData.customers.reduce((sum, c) => sum + Number(c.accounts_paid || 0), 0).toLocaleString()}</td>
      <td>
        {(
          reportData.customers.reduce(
            (sum, c) =>
              sum +
              (Number(c.digicel) || 0) +
              (Number(c.gtt) || 0) +
              (Number(c.mmg) || 0) +
              (Number(c.prepaid) || 0) +
              (Number(c.other_credit) || 0) -
              (Number(c.accounts_paid) || 0),
            0
          )
        ).toLocaleString()}
      </td>
    </tr>
  </tbody>
</table>

        <button onClick={() => addRow("customers")}>Add Customer</button>

        {/* Totals Section */}
        <h3>Totals</h3>
        <table className="totals-section">
          <tbody>
            <tr>
              <td>Total Credit Sale</td>
              <td>Opening Balance</td>
              <td>Closing Balance</td>
              <td>Sale</td>
            </tr>
            <tr>
              <td>{reportData.customers.reduce((sum, c) => sum + Number(c.digicel || 0) + Number(c.gtt || 0) + Number(c.mmg || 0) + Number(c.prepaid || 0) + Number(c.other_credit || 0), 0)}</td>
              <td>{reportData.opening_balance || 0}</td>
              <td>{reportData.closing_balance || 0}</td>
              <td>{(reportData.opening_balance || 0) - (reportData.closing_balance || 0)}</td>
            </tr>
          </tbody>
        </table>

        {/* Digicel Wholesale */}
        <h3>Digicel Wholesale</h3>
<table>
  <thead>
    <tr>
      <th>Agent</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {reportData.digicel_wholesale.map((wholesale, index) => (
      <tr key={index}>
        <td><input type="text" onChange={(e) => handleInputChange(e, "digicel_wholesale", index, "agent")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "digicel_wholesale", index, "amount")} /></td>
      </tr>
    ))}
    {/* Totals Row */}
    <tr className="totals-row">
      <td><strong>Total</strong></td>
      <td>{calculateTotals().digicel_wholesale}</td>
    </tr>
  </tbody>
</table>
<button onClick={() => addRow("digicel_wholesale")}>Add Wholesale Entry</button>


<h3>Misc Sales</h3>
<table>
  <thead>
    <tr>
      <th>Particulars</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {reportData.misc_sales.map((sale, index) => (
      <tr key={index}>
        <td><input type="text" onChange={(e) => handleInputChange(e, "misc_sales", index, "particulars")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "misc_sales", index, "amount")} /></td>
      </tr>
    ))}
    {/* Totals Row */}
    <tr className="totals-row">
      <td><strong>Total</strong></td>
      <td>{calculateTotals().misc_sales}</td>
    </tr>
  </tbody>
</table>
<button onClick={() => addRow("misc_sales")}>Add Misc Sale</button>
<h3>Cash Payouts</h3>
<table>
  <thead>
    <tr>
      <th>Details</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {reportData.cash_payouts.map((payout, index) => (
      <tr key={index}>
        <td><input type="text" onChange={(e) => handleInputChange(e, "cash_payouts", index, "details")} /></td>
        <td><input type="number" onChange={(e) => handleInputChange(e, "cash_payouts", index, "amount")} /></td>
      </tr>
    ))}
    {/* Totals Row */}
    <tr className="totals-row">
      <td><strong>Total</strong></td>
      <td>{calculateTotals().cash_payouts}</td>
    </tr>
  </tbody>
</table>
<button onClick={() => addRow("cash_payouts")}>Add Cash Payout</button>


        {/* Submit & Cancel Buttons */}
        <div className="modal-buttons">
          <button className="save-btn" onClick={handleSubmit}>Save Report</button>
          <button className="cancel-btn" onClick={closeModal}>Cancel</button>
          <button className="close-btn" onClick={closeModal}>Close</button> {/* ✅ New Close Button */}
          <button className="finish-btn" onClick={handleFinishReport}>Finish Report</button>
        </div>
      </div>
    </div>
  );
};

export default NewReportModal;
