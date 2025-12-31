import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaHotel, FaTags, FaThumbsUp, FaPercentage } from "react-icons/fa";


export default function Footer() {
  const faqs = [
    {
      question: "How to book a hotel online with GeoBookings?",
      answer:
        "Booking a hotel online is easy through GeoBookings. Download the app or use the website, enter city details, dates, and preferences, then tap Search. Use filters and reviews to select your preferred hotel."
    },
    {
      question: "How to find the cheapest hotel deals in any city?",
      answer:
        "Use the Sort & Filter option on GeoBookings and drag down the Price slider to your range. You can also filter by Wi-Fi, room service, or in-house restaurants for the best value."
    },
    {
      question: "How to find the best hotels near me?",
      answer:
        "After searching for your city, GeoBookings shows you hotels by area or landmark. For instance, in Goa, you’ll find hotels near Baga or Calangute Beach, with options ideal for families or couples."
    },
    {
      question: "Where can I find current deals and offers?",
      answer:
        "Look for the ‘MMT Exclusive Deal’ badge under hotel listings on the app or website. Offers are updated daily and vary by location and property."
    }
  ];

  return (
    <>
      {/* ✅ FAQ Section (without cards) */}
      <div className="container py-5" style={{ background: "transparent" }}>
        <h2 className="fw-bold text-center mb-5" style={{ color: "#FFF" }}>Frequently Asked Questions</h2>
        <ul className="list-unstyled">
          {faqs.map((faq, index) => (
            <li key={index} className="mb-4">
              <h5 className="fw-bold mb-2" style={{ color: "#FFF" }}>
                {faq.question}
              </h5>
              <p className="mb-0" style={{ color: "rgba(255, 255, 255, 0.85)" }}>{faq.answer}</p>
              <hr className="mt-3" style={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Footer Section */}
      <footer
        className="text-light py-5 mt-auto"
        style={{
          background: "linear-gradient(to right, #000000, #222222)",
        }}
      >
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <span className="me-4" style={{ fontSize: "2rem" }}>
              <i className="bi bi-instagram"></i>
            </span>
            <span className="me-4" style={{ fontSize: "2rem" }}>
              <i className="bi bi-twitter-x"></i>
            </span>
            <span className="me-4" style={{ fontSize: "2rem" }}>
              <i className="bi bi-linkedin"></i>
            </span>
            <span className="me-4" style={{ fontSize: "2rem" }}>
              <i className="bi bi-facebook"></i>
            </span>
          </div>
          <div
            className="text-center text-md-end fw-bold mt-2 mt-md-0"
            style={{ fontSize: "1.2rem" }}
          >
            © 2025 GeoBookings PVT. LTD.
          </div>
        </div>
      </footer>
    </>
  );
}
