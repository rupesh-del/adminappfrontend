import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../Styles/ChequeDetails.css";
import api from "../api";  // Ensure this points to your `api.js`

const formatLongDate = (dateString) => {
  if (!dateString) return "N/A"; // Handle empty values

  // ✅ Convert to a Date object while preventing time zone shifts
  const date = new Date(dateString + "T00:00:00"); // Forces local midnight

  if (isNaN(date)) return "Invalid Date"; // Handle invalid dates

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  // ✅ Convert day to ordinal format (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num) => {
    if (num > 3 && num < 21) return "th"; // Covers 4th-20th
    switch (num % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

const ChequeDetails = () => {
  const location = useLocation();
  const cheque_number = useParams().cheque_number; // ✅ Extract cheque_number at the top
  const navigate = useNavigate();

  console.log(`✅ cheque_number extracted: ${cheque_number}`);

  // Initialize state without conditionals
  const [cheque, setCheque] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track edit mode

  const handleEditClick = () => {
  setIsEditing((prev) => !prev); // Toggle edit mode
};

  const [hasNewDetails, setHasNewDetails] = useState(false); // New state for new details

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle empty values
    return new Date(dateString).toISOString().split("T")[0]; // Extracts YYYY-MM-DD
  };
 
  const [details, setDetails] = useState({
    address: "",  
    phone_number: "",
    id_type: "National ID",
    id_number: "",
    date_of_issue: "",
    date_of_expiry: "",
    date_of_birth: "",
  });
  
  const handleSaveDetails = async () => {
    const chequeNumber = cheque?.cheque_number || "";
  
    if (!chequeNumber) {
      console.error("❌ No cheque number found!");
      return;
    }
  
    const formatPhoneNumber = (number) => {
      return number ? number.replace(/\D/g, "").slice(0, 20) : ""; // Remove non-numeric characters
    };
  
    const formatDateForSave = (dateString) => {
      return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
    };
  
    let detailsToSave = {
      address: details.address?.trim() || "",
      phone_number: formatPhoneNumber(details?.phone_number || ""),
      id_type: details.id_type?.trim() || "National ID",
      id_number: details.id_number?.trim() || "",
      date_of_issue: formatDateForSave(details.date_of_issue),
      date_of_expiry: formatDateForSave(details.date_of_expiry),
      date_of_birth: formatDateForSave(details.date_of_birth),
    };
  
    // ✅ Check if this is a new entry (all fields empty)
    const isNewEntry = Object.values(detailsToSave).every(value => value === "");
  
    if (isNewEntry) {
      alert("❌ Cannot save empty details!");
      return;
    }
  
    console.log("🔹 Checking for existing cheque details...");
  
    const existingDetails = await api.getChequeDetails(chequeNumber);
  
    if (!existingDetails) {
      console.log("🆕 No existing details found. Creating new cheque details...");
      const response = await api.saveChequeDetails(chequeNumber, detailsToSave);
      
      if (response) {
        alert("✅ Cheque details saved successfully!");
        setHasNewDetails(false); // Reset state after saving
      } else {
        alert("❌ Failed to save cheque details!");
      }
      return;
    }
  
    // ✅ Determine which fields have changed (send only those)
    const updatedFields = {};
    Object.keys(detailsToSave).forEach((key) => {
      if (detailsToSave[key] !== existingDetails[key]) {
        updatedFields[key] = detailsToSave[key];
      }
    });
  
    if (Object.keys(updatedFields).length === 0) {
      alert("⚠ No changes detected. Nothing to update.");
      return;
    }
  
    console.log("✏ Updating cheque details:", updatedFields);
    const editResponse = await api.editChequeDetails(chequeNumber, updatedFields);
  
    if (editResponse) {
      alert("✅ Cheque details updated successfully!");
      setIsEditing(false);
    } else {
      alert("❌ Failed to update cheque details!");
    }
  };
  
  
  // Load cheque from location or fetch from API
  useEffect(() => {
    const fetchChequeData = async () => {
      if (!cheque_number) {
        console.error("❌ cheque_number is missing from URL!");
        return;
      }
  
      try {
        // ✅ Fetch cheque details from `cheques` table
        const mainCheque = await api.getChequeByNumber(cheque_number);
        if (mainCheque) {
          console.log("✅ Main cheque details:", mainCheque);
          setCheque(mainCheque);
        }
  
        // ✅ Fetch additional cheque details from `cheque_details`
        const chequeDetails = await api.getChequeDetails(cheque_number);
        if (chequeDetails) {
          console.log("✅ Cheque additional details:", chequeDetails);
          setDetails((prevDetails) => ({
            ...prevDetails,
            address: chequeDetails.address || "",
            phone_number: chequeDetails.phone_number || "",
            id_type: chequeDetails.id_type || "National ID",
            id_number: chequeDetails.id_number || "",
            date_of_issue: chequeDetails.date_of_issue ? chequeDetails.date_of_issue.split("T")[0] : "",
            date_of_expiry: chequeDetails.date_of_expiry ? chequeDetails.date_of_expiry.split("T")[0] : "",
            date_of_birth: chequeDetails.date_of_birth ? chequeDetails.date_of_birth.split("T")[0] : "",
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching cheque data:", error);
      }
    };
  
    fetchChequeData();
  }, [cheque_number]); // ✅ Runs when cheque_number changes
  
  

  // Handle input changes
  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  
    // Detect if new details are entered
    if (e.target.value.trim() !== "") {
      setHasNewDetails(true);
    }
  };
  
  // Handle Delete Cheque
  const handleDelete = async (chequeNumber) => {
    try {
      const response = await api.deleteCheque(chequeNumber);
      if (response) {
        console.log("Cheque deleted successfully");
        navigate("/cheque-tracker"); // Redirect to Cheque Tracker page
      } else {
        console.error("Error deleting cheque");
      }
    } catch (error) {
      console.error("Error deleting cheque:", error);
    }
  };

  if (!cheque) {
    return <p>Loading cheque details...</p>;
  }

  return (
    <div className="cheque-details-container">
      <button className="back-button" onClick={() => navigate("/cheque-tracker")}>
        ← Back to Cheques
      </button>

      <div className="cheque-details-box">
  <h2>Cheque Details</h2>

  <div className="details-grid">
    <div className="details-column">
      <div className="field-box"><span className="label">Cheque Number:</span> <span className="value">{cheque.cheque_number}</span></div>
      <div className="field-box"><span className="label">Bank Drawn:</span> <span className="value">{cheque.bank_drawn}</span></div>
      <div className="field-box"><span className="label">Payer:</span> <span className="value">{cheque.payer}</span></div>
      <div className="field-box"><span className="label">Payee:</span> <span className="value">{cheque.payee}</span></div>
      <div className="field-box"><span className="label">Amount:</span> <span className="value">${(Number(cheque.amount) || 0).toFixed(2)}</span></div>
    </div>

    <div className="details-column">
      <div className="field-box"><span className="label">Admin Charge:</span> <span className="value">${(Number(cheque.admin_charge) || 0).toFixed(2)}</span></div>
      <div className="field-box"><span className="label">Net to Payee:</span> <span className="value">${(Number(cheque.net_to_payee) || (Number(cheque.amount) - Number(cheque.admin_charge)) || 0).toFixed(2)}</span></div>
      <div className="field-box"><span className="label">Date Posted:</span> <span className="value">{cheque.date_posted ? new Date(cheque.date_posted).toLocaleDateString() : "N/A"}</span></div>
      <div className="field-box"><span className="label">Status:</span> <span className="value">{cheque.status}</span></div>
    </div>
  </div>
</div>

<h3>Additional Information</h3>

<div className="details-grid">
  <div className="details-column">
    <div className="field-box">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={details.address || ""}
        onChange={handleChange}
        disabled={!isEditing} // ✅ Disable unless editing
        placeholder="Enter Address"
      />
    </div>

    <div className="field-box">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phone_number"
        value={details.phone_number || ""}
        onChange={(e) => {
          let onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
          if (onlyNumbers.length > 20) {
            onlyNumbers = onlyNumbers.slice(0, 20); // Enforce max 20 characters
          }
          setDetails({ ...details, phone_number: onlyNumbers });
        }}
        disabled={!isEditing} // ✅ Disable unless editing
        placeholder="Enter Phone Number"
      />
    </div>

    <div className="field-box">
      <label>ID Type:</label>
      <select
        name="id_type"
        value={details.id_type || "National ID"} // ✅ Ensure a default value
        onChange={(e) => setDetails({ ...details, id_type: e.target.value })}
        disabled={!isEditing} // ✅ Disable unless editing
      >
        <option value="National ID">National ID</option>
        <option value="Driver's License">Driver's License</option>
        <option value="Passport">Passport</option>
      </select>
    </div>
  </div>

  <div className="details-column">
    <div className="field-box">
      <label>ID Number:</label>
      <input
        type="text"
        name="id_number"
        value={details.id_number || ""}
        onChange={handleChange}
        disabled={!isEditing} // ✅ Disable unless editing
        placeholder="Enter ID Number"
      />
    </div>

    <div className="field-box">
      <label>Date of Issue:</label>
      <input
        type="date"
        name="date_of_issue"
        value={details.date_of_issue || ""}
        onChange={(e) => {
          setDetails({ ...details, date_of_issue: e.target.value });
        }}
        disabled={!isEditing} // ✅ Disable unless editing
      />
      <p className="formatted-date">📅 {formatLongDate(details.date_of_issue)}</p> 
    </div>

    <div className="field-box">
      <label>Date of Expiry:</label>
      <input
        type="date"
        name="date_of_expiry"
        value={details.date_of_expiry || ""}
        onChange={(e) => {
          setDetails({ ...details, date_of_expiry: e.target.value });
        }}
        disabled={!isEditing} // ✅ Disable unless editing
      />
      <p className="formatted-date">📅 {formatLongDate(details.date_of_expiry)}</p> 
    </div>

    <div className="field-box">
      <label>Date of Birth:</label>
      <input
        type="date"
        name="date_of_birth"
        value={details.date_of_birth || ""}
        onChange={(e) => {
          setDetails({ ...details, date_of_birth: e.target.value });
        }}
        disabled={!isEditing} // ✅ Disable unless editing
      />
      <p className="formatted-date">📅 {formatLongDate(details.date_of_birth)}</p> 
    </div>
  </div>
</div>


      <div className="button-container">
  {/* Save button appears only when new details are entered */}
  {hasNewDetails && !isEditing && (
    <button className="save-button" onClick={handleSaveDetails}>
      Save
    </button>
  )}

  {/* Edit button toggles to "Save Changes" when clicked */}
  {isEditing ? (
    <button className="save-button" onClick={handleSaveDetails}>
      Save Changes
    </button>
  ) : (
    <button className="edit-button" onClick={() => setIsEditing(true)}>
      Edit
    </button>
  )}
</div>

      <div className="button-container">
        <button className="delete-btn" onClick={() => handleDelete(cheque.cheque_number)}>
          Delete Cheque
        </button>
      </div>
    </div>
  );
};

export default ChequeDetails;
