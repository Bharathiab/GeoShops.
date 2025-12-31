import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function Getitnow() {
  return (
    <div className="container my-5 py-5">
      {/* MAIN GLASS CARD - Download App Section */}
      <div
        className="card border-0 rounded-4 shadow-lg overflow-hidden mb-5"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(199, 146, 255, 0.3)",
          boxShadow: "0 20px 60px rgba(139, 92, 246, 0.3)",
        }}
      >
        <div className="row g-0 align-items-center p-5">
          <div className="col-lg-8">
            <h2 className="display-5 fw-bold text-white mb-3">
              <FontAwesomeIcon icon={faDownload} className="me-3" style={{ color: "#e879f9" }} />
              Download App Now!
            </h2>
            <p className="fs-5 text-white opacity-90 mb-4">
              Use code <span className="fw-bold text-warning">WELCOMEMMT</span> and get up to{" "}
              <span className="fw-bold text-success">₹5000 OFF</span> on your first booking!
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 align-items-center mb-4">
              <div className="input-group" style={{ maxWidth: 420 }}>
                <span className="input-group-text bg-transparent border-white text-white">
                  India +91
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent text-white border-white"
                  placeholder="Enter Mobile Number"
                  style={{ "::placeholder": { color: "rgba(255,255,255,0.7)" } }}
                />
                <button
                  className="btn rounded-end px-5 fw-bold"
                  style={{
                    background: "linear-gradient(45deg, #e879f9, #d946ef)",
                    color: "white",
                    border: "none",
                    boxShadow: "0 0 30px rgba(233, 121, 249, 0.6)",
                  }}
                >
                  GET APP LINK
                </button>
              </div>
            </div>

            <div className="d-flex gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Play Store"
                height="50"
                className="shadow-sm"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
                alt="App Store"
                height="50"
                className="shadow-sm"
              />
            </div>
          </div>

          {/* QR CODE - Pure Black & White */}
          <div className="col-lg-4 text-center">
            <div
              className="p-4 rounded-4 d-inline-block"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://your-app-link.com&color=000000&bgcolor=FFFFFF&qzone=2"
                alt="Scan QR Code"
                className="img-fluid rounded"
                style={{
                  background: "white",
                  padding: "12px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                }}
              />
              <p className="text-white mt-3 mb-0 fw-semibold">Scan to Download</p>
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR DESTINATIONS - Glass Cards */}
      <div className="row g-4">
        {[
          [
            { title: "Goa", desc: "Beaches & Villas", img: "https://images.pexels.com/photos/127162/pexels-photo-127162.jpeg" },
            { title: "Ooty", desc: "Hill Stations", img: "https://images.pexels.com/photos/303045/pexels-photo-303045.jpeg" },
            { title: "Jaipur", desc: "Palaces & Forts", img: "https://images.pexels.com/photos/1796726/pexels-photo-1796726.jpeg" },
            { title: "Singapore", desc: "City Luxury", img: "https://images.pexels.com/photos/3586966/pexels-photo-3586966.jpeg" },
            { title: "Phuket", desc: "Island Paradise", img: "https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg" },
            { title: "Maldives", desc: "Water Villas", img: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg" },
          ],
          [
            { title: "Delhi", desc: "Capital Stay", img: "https://images.pexels.com/photos/739416/pexels-photo-739416.jpeg" },
            { title: "Manali", desc: "Snow & Adventure", img: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg" },
            { title: "Bangkok", desc: "Night Markets", img: "https://images.pexels.com/photos/236146/pexels-photo-236146.jpeg" },
            { title: "Bali", desc: "Temples & Beaches", img: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg" },
            { title: "Dubai", desc: "Ultra Luxury", img: "https://images.pexels.com/photos/983399/pexels-photo-983399.jpeg" },
            { title: "Shimla", desc: "Colonial Charm", img: "https://images.pexels.com/photos/1673977/pexels-photo-1673977.jpeg" },
          ],
        ].map((column, colIdx) => (
          <div className="col-lg-6" key={colIdx}>
            <div
              className="h-100 p-4 rounded-4"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(199, 146, 255, 0.25)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
              }}
            >
              {column.map((city, idx) => (
                <div className="d-flex align-items-center mb-4" key={idx}>
                  <img
                    src={city.img}
                    alt={city.title}
                    className="rounded-circle me-3 shadow-sm"
                    width="65"
                    height="65"
                    style={{
                      objectFit: "cover",
                      border: "3px solid rgba(199, 146, 255, 0.5)",
                    }}
                  />
                  <div>
                    <h5 className="text-white fw-bold mb-1">{city.title}</h5>
                    <p className="text-white opacity-80 mb-0 small">{city.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Getitnow;