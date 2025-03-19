import { useState } from "react";
import "../Styles/NewChequeModal.css"; // Ensure correct CSS file

const NewChequeModal = ({ onClose, onSave }) => {
  const [cheque, setCheque] = useState({
    cheque_number: "",
    bank_drawn: "",
    payer: "",
    payee: "",
    amount: "",
    admin_charge: 0,
    date_posted: new Date().toISOString().split('T')[0], // ✅ Default to today
    status: "Unpresented",
  });
  

  const handleChange = (e) => {
    setCheque({ ...cheque, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newCheque = {
      cheque_number: cheque.cheque_number || "",
      bank_drawn: cheque.bank_drawn || "",
      payer: cheque.payer || "",
      payee: cheque.payee || "",
      amount: parseFloat(cheque.amount) || 0,
      admin_charge: parseFloat(cheque.admin_charge) || 0,
      net_to_payee: (parseFloat(cheque.amount) - parseFloat(cheque.admin_charge)) || 0,
      date_posted: cheque.date_posted || new Date().toISOString().split('T')[0], // ✅ Ensure date is sent
      status: cheque.status || "Unpresented",
    };
  
    console.log("🚀 Saving cheque:", newCheque); // ✅ Debugging log
  
    onSave(newCheque);
    onClose();
  };
  
  
  return (
<div className="modal-overlay">
  <div className="modal-content">
    <h2>New Cheque</h2>

    <div className="modal-form">
      <div className="input-row">
        <div className="input-group">
          <label>Cheque Number:</label>
          <input type="text" name="cheque_number" value={cheque.cheque_number} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Bank Drawn:</label>
          <input type="text" name="bank_drawn" value={cheque.bank_drawn} onChange={handleChange} required />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Payer:</label>
          <input type="text" name="payer" value={cheque.payer} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Payee:</label>
          <input type="text" name="payee" value={cheque.payee} onChange={handleChange} required />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Amount:</label>
          <input type="number" name="amount" value={cheque.amount} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Admin Charge:</label>
          <input type="number" name="admin_charge" value={cheque.admin_charge} onChange={handleChange} />
        </div>
      </div>

      <div className="input-group">
        <label>Status:</label>
        <select name="status" value={cheque.status} onChange={handleChange}>
          <option value="Unpresented">Unpresented</option>
          <option value="Deposited">Deposited</option>
          <option value="Cleared">Cleared</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div className="modal-buttons">
      <button className="save-btn" onClick={handleSubmit}>Save</button>
      <button className="cancel-btn" onClick={onClose}>Cancel</button>
    </div>
  </div>
</div>

  );
};

export default NewChequeModal;
