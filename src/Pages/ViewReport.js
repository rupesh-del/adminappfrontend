import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // Ensure correct API import
import "../Styles/viewreport.css"; // Ensure styles are linked

const ViewReport = () => {
  const { reportId } = useParams(); // Get report ID (which is a date)
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { reportDate } = useParams();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
        console.log(`🔄 Fetching Report for Date: ${reportDate}`);

        // ✅ Ensure date format is correct
        const formattedDate = reportDate.includes("T") ? reportDate.split("T")[0] : reportDate;
        console.log(`📅 Formatted Date Sent to API: ${formattedDate}`);

        const data = await api.getDailyReceivablesReportByDate(formattedDate);
        console.log("✅ API Response Data:", data);

        if (!data || data.error) {
            console.error("❌ Error fetching report:", data?.error || "No report found.");
            setReport(null);
        } else {
            setReport({
                ...data,
                customers: Array.isArray(data.report_data?.customers) ? data.report_data.customers : [], // ✅ Ensure customers is an array
                digicel_wholesale: Array.isArray(data.report_data?.digicel_wholesale) ? data.report_data.digicel_wholesale : [],
                misc_sales: Array.isArray(data.report_data?.misc_sales) ? data.report_data.misc_sales : [],
                cash_payouts: Array.isArray(data.report_data?.cash_payouts) ? data.report_data.cash_payouts : []
            });
            console.log("✅ Report Data Successfully Loaded:", data);
        }
    } catch (error) {
        console.error("❌ API Error:", error);
        setReport(null);
    } finally {
        setLoading(false);
    }
};



  if (loading) return <p>Loading report...</p>;

  if (!report) return <p>No report found.</p>;

  return (
    <div className="view-report-container">
        <h2>View Report</h2>

        <label>Date:</label>
        <input type="date" value={new Date(report.report_date).toISOString().split("T")[0]} disabled />

        <label>Opening Balance:</label>
        <input type="number" value={report.opening_balance || 0} disabled />

        <label>Closing Balance:</label>
        <input type="number" value={report.closing_balance || 0} disabled />

        {/* ✅ Receivables Sheet Table */}
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
                    <td>{customer.name}</td>
                    <td>{customer.digicel || 0}</td>
                    <td>{customer.gtt || 0}</td>
                    <td>{customer.mmg || 0}</td>
                    <td>{customer.prepaid || 0}</td>
                    <td>{customer.other_credit || 0}</td>
                    <td>{customer.accounts_paid || 0}</td>
                    <td>
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
            <td classname= "net-column">
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

        {/* ✅ Container for the Three Subforms */}
        <div className="subforms-container">

            {/* ✅ Digicel Wholesale */}
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
                                    <td>{wholesale.agent}</td>
                                    <td>{wholesale.amount || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2">No wholesale entries.</td></tr>
                        )}
                        <tr><td><strong>Total</strong></td><td>{report.digicel_wholesale.reduce((sum, w) => sum + Number(w.amount || 0), 0)}</td></tr>
                    </tbody>
                </table>
            </div>

            {/* ✅ Misc Sales */}
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
                                    <td>{sale.particulars}</td>
                                    <td>{sale.amount || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2">No misc sales.</td></tr>
                        )}
                        <tr><td><strong>Total</strong></td><td>{report.misc_sales.reduce((sum, s) => sum + Number(s.amount || 0), 0)}</td></tr>
                    </tbody>
                </table>
            </div>

            {/* ✅ Cash Payouts */}
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
                                    <td>{payout.details}</td>
                                    <td>{payout.amount || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2">No cash payouts.</td></tr>
                        )}
                        <tr><td><strong>Total</strong></td><td>{report.cash_payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0)}</td></tr>
                    </tbody>
                </table>
            </div>

        </div> {/* ✅ End of subforms-container */}

        <button className="back-btn" onClick={() => navigate("/daily-receivables")}>
            Back to Daily Receivables
        </button>
    </div>
);
};

export default ViewReport;
