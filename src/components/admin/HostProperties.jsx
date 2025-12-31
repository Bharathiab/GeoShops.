import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import DepartmentFilter from "./DepartmentFilter";

const HostProperties = () => {
  const [selectedDept, setSelectedDept] = useState("Hotel");
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadProperties = () => {
      const savedProperties = localStorage.getItem("hostProperties");
      if (savedProperties) {
        try {
          const allProperties = JSON.parse(savedProperties);
          setProperties(allProperties);
        } catch (e) {
          setProperties([]);
        }
      } else {
        setProperties([]);
      }
    };

    loadProperties();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "hostProperties") {
        loadProperties();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filtered = properties.filter((p) => p.department === selectedDept);

  return (
    <>
      <AdminNavbar />

      <div className="admin-page">
        <h2>Host Properties</h2>

        <DepartmentFilter
          selected={selectedDept}
          setSelected={setSelectedDept}
        />

        <table className="admin-table mt-3">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Company Name</th>
              <th>Description</th>
              <th>Amenities</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.company}</td>
                <td>{p.description}</td>
                <td>{p.amenities}</td>
                <td>{p.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default HostProperties;
