import React from "react";
import AdminNavbar from "./AdminNavbar";

const HostsList = () => {
  const hosts = [
    { id: 1, company: "Royal Stays", owner: "Manoj", phone: "9876543210" },
    { id: 2, company: "City Cabs", owner: "Ramesh", phone: "9090909090" },
  ];

  return (
    <>
      <AdminNavbar />

      <div className="admin-page">
        <h2>Host Companies</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Company Name</th>
              <th>Owner</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {hosts.map((h, index) => (
              <tr key={h.id}>
                <td>{index + 1}</td>
                <td>{h.company}</td>
                <td>{h.owner}</td>
                <td>{h.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default HostsList;
