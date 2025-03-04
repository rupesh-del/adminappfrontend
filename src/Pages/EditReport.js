import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../Styles/EditReport.css"; // New CSS file for styling

const EditReport = () => {
    const { reportDate } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            console.log(`🔄 Fetching Report for Date: ${reportDate}`);
            const data = await api.getDailyReceivablesReportByDate(reportDate);
    
            if (!data || data.error) {
                console.error("❌ Error fetching report:", data?.error || "No report found.");
                setReport(null);
            } else {
                console.log("✅ Report Data Loaded:", data);
    
                setReport({
                    ...data,
                    report_date: data.report_date.split("T")[0], // ✅ Convert to YYYY-MM-DD format
                    customers: data.report_data?.customers || [],
                    digicel_wholesale: data.report_data?.digicel_wholesale || [],
                    misc_sales: data.report_data?.misc_sales || [],
                    cash_payouts: data.report_data?.cash_payouts || []
                });
    
                setIsFinished(data.status === "finished");
            }
        } catch (error) {
            console.error("❌ API Error:", error);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleInputChange = (e, section, index, field) => {
        if (isFinished) return; // Prevent changes if the report is finished
    
        const value = e.target.value;
    
        setReport((prevData) => {
            if (section === "opening_balance" || section === "closing_balance") {
                return { ...prevData, [section]: parseFloat(value) || 0 }; // ✅ Ensure numeric values
            }
    
            const updatedSection = [...prevData[section]];
            updatedSection[index] = { ...updatedSection[index], [field]: value };
            return { ...prevData, [section]: updatedSection };
        });
    };
    
    const addRow = (section) => {
        setReport((prevReport) => ({
            ...prevReport,
            [section]: [...prevReport[section], {}] // ✅ Add empty row
        }));
    };
    
    const handleSaveReport = async () => {
        if (!report) return;
        console.log("📤 Saving Report Data:", report);
        await api.createOrUpdateDailyReceivablesReport(report);
    };

    const handleFinishReport = async () => {
        if (!report) return;
        console.log(`🚫 Finishing Report: ${report.report_date}`);
    
        const formattedDate = new Date(report.report_date).toISOString().split("T")[0]; // ✅ Format the date
    
        const response = await api.finishDailyReceivablesReport(formattedDate);
    
        if (!response.error) {
            setIsFinished(true);
            console.log("✅ Report Successfully Finished.");
        } else {
            console.error("❌ Failed to finish report:", response.error);
        }
    };
    
    
    
    if (loading) return <p>Loading report...</p>;
    if (!report) return <p>No report found.</p>;

    return (
        <div className="edit-report-container">
            <h2>Edit Report</h2>
            <button className="back-to-receivables-btn" onClick={() => navigate("/daily-receivables")}>
        Back to Daily Receivables
    </button>
            <label>Date:</label>
            <input type="date" value={report.report_date} disabled />
    
            <label>Opening Balance:</label>
            <input type="number" value={report.opening_balance || ""} onChange={(e) => handleInputChange(e, "opening_balance")} disabled={isFinished} />
    
            <label>Closing Balance:</label>
            <input type="number" value={report.closing_balance || ""} onChange={(e) => handleInputChange(e, "closing_balance")} disabled={isFinished} />
    
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
        {report.customers.length > 0 ? (
            report.customers.map((customer, index) => (
                <tr key={index}>
                    <td><input type="text" value={customer.name || ""} onChange={(e) => handleInputChange(e, "customers", index, "name")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.digicel || ""} onChange={(e) => handleInputChange(e, "customers", index, "digicel")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.gtt || ""} onChange={(e) => handleInputChange(e, "customers", index, "gtt")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.mmg || ""} onChange={(e) => handleInputChange(e, "customers", index, "mmg")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.prepaid || ""} onChange={(e) => handleInputChange(e, "customers", index, "prepaid")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.other_credit || ""} onChange={(e) => handleInputChange(e, "customers", index, "other_credit")} disabled={isFinished} /></td>
                    <td><input type="number" value={customer.accounts_paid || ""} onChange={(e) => handleInputChange(e, "customers", index, "accounts_paid")} disabled={isFinished} /></td>
                    <td classname="net-column">
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
            ))
        ) : (
            <tr>
                <td colSpan="8">No customers listed.</td>
            </tr>
        )}

        {/* ✅ Totals Row Below All Entries */}
        <tr className="totals-row">
            <td><strong>Totals</strong></td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.digicel || 0), 0).toLocaleString()}</td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.gtt || 0), 0).toLocaleString()}</td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.mmg || 0), 0).toLocaleString()}</td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.prepaid || 0), 0).toLocaleString()}</td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.other_credit || 0), 0).toLocaleString()}</td>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.accounts_paid || 0), 0).toLocaleString()}</td>
            <td>
                {(
                    report.customers.reduce(
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

{/* ✅ Add Customer Button */}
<button className="add-button" onClick={() => addRow("customers")}>Add Customer</button>

{/* ✅ Totals Section */}
<h3>Totals</h3>
<table className="totals-section">
    <thead>
        <tr>
            <th>Total Credit Sale</th>
            <th>Opening Balance</th>
            <th>Closing Balance</th>
            <th>Sale</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{report.customers.reduce((sum, c) => sum + Number(c.digicel || 0) + Number(c.gtt || 0) + Number(c.mmg || 0) + Number(c.prepaid || 0) + Number(c.other_credit || 0), 0)}</td>
            <td>{report.opening_balance || 0}</td>
            <td>{report.closing_balance || 0}</td>
            <td>{(report.opening_balance || 0) - (report.closing_balance || 0)}</td>
        </tr>
    </tbody>
</table>
{/* ✅ Container for the three subforms in one line */}
<div className="subforms-container">

    {/* ✅ Digicel Wholesale Section */}
    <div className="subform">
        <h3>Digicel Wholesale</h3>
        <table>
            <thead>
                <tr>
                    <th>Agent</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {report.digicel_wholesale.length > 0 ? (
                    report.digicel_wholesale.map((wholesale, index) => (
                        <tr key={index}>
                            <td><input type="text" value={wholesale.agent || ""} onChange={(e) => handleInputChange(e, "digicel_wholesale", index, "agent")} disabled={isFinished} /></td>
                            <td><input type="number" value={wholesale.amount || ""} onChange={(e) => handleInputChange(e, "digicel_wholesale", index, "amount")} disabled={isFinished} /></td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="2">No wholesale entries.</td></tr>
                )}
                <tr><td><strong>Total</strong></td><td>{report.digicel_wholesale.reduce((sum, w) => sum + Number(w.amount || 0), 0)}</td></tr>
            </tbody>
        </table>
        <button className="add-button" onClick={() => addRow("digicel_wholesale")}>Add Wholesale Entry</button>
    </div>

    {/* ✅ Misc Sales Section */}
    <div className="subform">
        <h3>Misc Sales</h3>
        <table>
            <thead>
                <tr>
                    <th>Particulars</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {report.misc_sales.length > 0 ? (
                    report.misc_sales.map((sale, index) => (
                        <tr key={index}>
                            <td><input type="text" value={sale.particulars || ""} onChange={(e) => handleInputChange(e, "misc_sales", index, "particulars")} disabled={isFinished} /></td>
                            <td><input type="number" value={sale.amount || ""} onChange={(e) => handleInputChange(e, "misc_sales", index, "amount")} disabled={isFinished} /></td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="2">No misc sales.</td></tr>
                )}
                <tr><td><strong>Total</strong></td><td>{report.misc_sales.reduce((sum, s) => sum + Number(s.amount || 0), 0)}</td></tr>
            </tbody>
        </table>
        <button className="add-button" onClick={() => addRow("misc_sales")}>Add Misc Sale</button>
    </div>

    {/* ✅ Cash Payouts Section */}
    <div className="subform">
        <h3>Cash Payouts</h3>
        <table>
            <thead>
                <tr>
                    <th>Details</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {report.cash_payouts.length > 0 ? (
                    report.cash_payouts.map((payout, index) => (
                        <tr key={index}>
                            <td><input type="text" value={payout.details || ""} onChange={(e) => handleInputChange(e, "cash_payouts", index, "details")} disabled={isFinished} /></td>
                            <td><input type="number" value={payout.amount || ""} onChange={(e) => handleInputChange(e, "cash_payouts", index, "amount")} disabled={isFinished} /></td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="2">No cash payouts.</td></tr>
                )}
                <tr><td><strong>Total</strong></td><td>{report.cash_payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0)}</td></tr>
            </tbody>
        </table>
        <button className="add-button" onClick={() => addRow("cash_payouts")}>Add Cash Payout</button>
    </div>

</div> {/* ✅ End of subforms-container */}

    
            <div className="modal-buttons">
                {!isFinished && <button className="save-btn" onClick={handleSaveReport}>Save Report</button>}
                {!isFinished && <button className="finish-btn" onClick={handleFinishReport}>Finish Report</button>}
                <button className="back-btn" onClick={() => navigate("/daily-receivables")}>Back to Reports</button>
            </div>
        </div>
    );
    
    
};

export default EditReport;
