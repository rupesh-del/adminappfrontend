import React from "react";
import "../Styles/EditTransactionModal.css";

const EditTransactionModal = ({ editingTransaction, setEditingTransaction, handleEditTransaction }) => {
  if (!editingTransaction) return null; // ✅ Prevents rendering when not needed

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Transaction</h3>

        <input 
          type="number" 
          placeholder="Debit ($)" 
          value={editingTransaction.debit || ""} 
          onChange={(e) => setEditingTransaction({ ...editingTransaction, debit: e.target.value, credit: "" })} 
        />

        <input 
          type="number" 
          placeholder="Credit ($)" 
          value={editingTransaction.credit || ""} 
          onChange={(e) => setEditingTransaction({ ...editingTransaction, credit: e.target.value, debit: "" })} 
        />

        <input 
          type="text" 
          placeholder="Details" 
          value={editingTransaction.details || ""} 
          onChange={(e) => setEditingTransaction({ ...editingTransaction, details: e.target.value })} 
        />

        <button className="save-btn" onClick={handleEditTransaction}>Save</button>
        <button className="cancel-btn" onClick={() => setEditingTransaction(null)}>Cancel</button>
      </div>
    </div>
  );
};

export default EditTransactionModal;
