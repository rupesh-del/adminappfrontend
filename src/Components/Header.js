import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",  // ✅ Displays full weekday (e.g., "Saturday")
    year: "numeric",
    month: "long",    // ✅ Displays full month name (e.g., "March")
    day: "numeric"
  });
  

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2e8b57",
    padding: "15px 20px",
    color: "white",
  };

  const navStyle = {
    display: "flex",
    gap: "20px",
  };

  const linkStyle = {
    textDecoration: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
  };

  return (
    <header style={headerStyle}>
      <div style={{ fontSize: "14px", fontWeight: "bold" }}>{currentDate}</div>

      <nav style={navStyle}>
        <NavLink to="/accounts" style={linkStyle}>Accounts</NavLink>
      </nav>

      <div
        style={{ fontSize: "18px", fontWeight: "bold", cursor: "pointer" }}
        onClick={() => window.location.href = "/"} // ✅ Fixes `useNavigate` issue
      >
        RCS ADMIN CONSOLE
      </div>
    </header>
  );
};

export default Header;
