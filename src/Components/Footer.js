import React from "react";

const Footer = ({ show }) => {
  if (!show) return null; // ✅ Only show on Home Page

  const footerStyle = {
    textAlign: "center",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} RCS - All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
