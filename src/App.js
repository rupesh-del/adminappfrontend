import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Accounts from "./Pages/Accounts.js";
import Reports from "./Pages/Reports";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import AccountDetails from "./Pages/AccountDetails";
import DailyReports from "./Pages/Reports"; // ✅ Ensure Daily Reports Page is imported
import DailyReceivables from "./Pages/DailyReceivables";
import GoalTracker from "./Pages/GoalTracker";
import CashReport from "./Pages/CashReport";
import PhoneCards from "./Pages/PhoneCards";
import ViewReport from "./Pages/ViewReport";
import EditReport from "./Pages/EditReport"; // ✅ Import the Edit Report page

const App = () => {
  return (
    <Router>
      <Header /> {/* ✅ Now inside Router to allow navigation */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/accounts/:id" element={<AccountDetails />} />
        <Route path="/daily-reports" element={<DailyReports />} />
        <Route path="/daily-receivables" element={<DailyReceivables />} />
        <Route path="/goal-tracker" element={<GoalTracker />} />
        <Route path="/cash-report" element={<CashReport />} />
        <Route path="/phone-cards" element={<PhoneCards />} />
        <Route path="/view-report/:reportDate" element={<ViewReport />} />
        <Route path="/edit-report/:reportDate" element={<EditReport />} />
             </Routes>
      <Footer show={window.location.pathname === "/"} />
    </Router>
  );
};

export default App;
