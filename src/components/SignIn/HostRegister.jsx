import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";

import AuthLayout from "./AuthLayout";
import { registerHost } from "../../api";
import Toast from "../../utils/toast";

const HostRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "", // Changed from phoneNumber to phone to match input name
    password: "",
    gstNumber: "",
    businessAddress: "",
    businessType: "",
    panNumber: "",
  });

  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hostData = {
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        gstNumber: formData.gstNumber,
        businessAddress: formData.businessAddress,
        businessType: formData.businessType,
        panNumber: formData.panNumber
      };
      const response = await registerHost(hostData);

      // Store host data in localStorage for immediate use
      if (response.success && response.data) {
        localStorage.setItem(
          "hostLoginData",
          JSON.stringify({
            username: response.data.companyName,
            hostId: response.data.hostId
          })
        );
      }

      Toast.success("Registration successful! Please select a subscription plan.");
      setTimeout(() => navigate("/host/subscription"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed. Please try again.";

      // Check if email already registered
      if (errorMessage.toLowerCase().includes("email already registered")) {
        setShowEmailExistsModal(true);
      } else {
        Toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="You're a HOST"
      videoSrc="https://cdn.pixabay.com/video/2021/10/05/90875-629483572_large.mp4" // Aurora Borealis Alt
      posterSrc="https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1280&q=80"
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="row g-2 mb-2"
        >
          <div className="col-md-6">
            <label className="form-label-glass">Company Name</label>
            <input
              className="auth-glass-input"
              placeholder="Business Legal Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-glass">Public Email</label>
            <input
              className="auth-glass-input"
              placeholder="contact@company.com"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="row g-2 mb-2"
        >
          <div className="col-md-6">
            <label className="form-label-glass">Phone Number</label>
            <input
              className="auth-glass-input"
              placeholder="+91..."
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-glass">Password</label>
            <input
              className="auth-glass-input"
              placeholder="Secure Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="row g-2 mb-2"
        >
          <div className="col-md-6">
            <label className="form-label-glass">GST Number</label>
            <input
              className="auth-glass-input"
              placeholder="GSTIN"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-glass">PAN Number</label>
            <input
              className="auth-glass-input"
              placeholder="ABCDE1234F"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-2"
        >
          <label className="form-label-glass">Business Address</label>
          <input
            className="auth-glass-input"
            placeholder="Complete street address"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-3"
        >
          <label className="form-label-glass">Business Type</label>
          <select
            className="auth-glass-input"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Hotel">Hotel / Resort</option>
            <option value="Cab">Cab / Transport</option>
            <option value="Hospital">Hospital / Clinic</option>
            <option value="Salon">Salon / Spa</option>
            <option value="Restaurant">Restaurant / Cafe</option>
            <option value="Event">Event / Wedding Venue</option>
            <option value="Gym">Gym / Fitness Center</option>
            <option value="Coworking">Coworking Space</option>
            <option value="Education">Education / Coaching</option>
            <option value="Tour">Tour / Adventure Guide</option>
            <option value="Rental">Equipment Rental</option>
            <option value="Other">Other Services</option>
          </select>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          type="submit"
          className="btn w-100 mb-2 shadow-sm py-2"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            border: "none",
            fontWeight: "700",
            borderRadius: "1rem",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 15px rgba(234, 88, 12, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Register Business
        </motion.button>

        <div className="text-center pt-3 mt-4 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <p className="mb-0 text-white-50 small">
            Already a Host?{" "}
            <span
              className="fw-bold"
              style={{
                color: "#ea580c",
                cursor: "pointer",
              }}
              onClick={() => navigate("/host-login")}
            >
              Login Here
            </span>
          </p>
        </div>
      </form>

      <Modal show={showEmailExistsModal} onHide={() => setShowEmailExistsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account Already Exists</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The email <strong>{formData.email}</strong> is already registered with us.</p>
          <p className="mb-0">Would you like to login instead?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailExistsModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#de5c06ff", borderColor: "#de5c06ff" }}
            onClick={() => navigate("/host-login")}
          >
            Login Now
          </Button>
        </Modal.Footer>
      </Modal>
    </AuthLayout>
  );
};

export default HostRegister;
