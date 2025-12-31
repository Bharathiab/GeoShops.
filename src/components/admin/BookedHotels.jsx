import React from "react";
import AdminNavbar from "./AdminNavbar";

const BookedHotels = () => {
  const bookings = [
    { id: 1, name: "Rahul", phone: "9876543210", hotel: "Sunrise Hotel" },
    { id: 2, name: "Priya", phone: "9087654321", hotel: "Blue Moon Resort" },
  ];

  return (
    <>
      <AdminNavbar />

      <div className="admin-page">
        <h2>Booked Hotels - Users</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>User Name</th>
              <th>Phone</th>
              <th>Booked Hotel</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, index) => (
              <tr key={b.id}>
                <td>{index + 1}</td>
                <td>{b.name}</td>
                <td>{b.phone}</td>
                <td>{b.hotel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BookedHotels;
