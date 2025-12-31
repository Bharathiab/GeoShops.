import React from "react";

const DepartmentFilter = ({ selected, setSelected }) => {
  return (
    <div className="department-filter">
      <button
        className={selected === "Hotel" ? "active" : ""}
        onClick={() => setSelected("Hotel")}
      >
        Hotel
      </button>

      <button
        className={selected === "Hospital" ? "active" : ""}
        onClick={() => setSelected("Hospital")}
      >
        Hospital
      </button>

      <button
        className={selected === "Salon" ? "active" : ""}
        onClick={() => setSelected("Salon")}
      >
        Salon
      </button>

      <button
        className={selected === "Cab" ? "active" : ""}
        onClick={() => setSelected("Cab")}
      >
        Cab
      </button>
    </div>
  );
};

export default DepartmentFilter;
