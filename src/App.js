import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Accounts from "./Pages/Accounts.js";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import AccountDetails from "./Pages/AccountDetails";
import ChequeTracker from "./Pages/ChequeTracker";
import ChequeDetails from "./Components/ChequeDetails";

const App = () => {
  return (
    <Router>
      <Header /> {/* ✅ Now inside Router to allow navigation */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetails />} />
        <Route path="/cheque-tracker" element={<ChequeTracker />} />
        <Route path="/cheque-details/:cheque_number" element={<ChequeDetails />} />
             </Routes>
      <Footer show={window.location.pathname === "/"} />
    </Router>
  );
};

export default App;
