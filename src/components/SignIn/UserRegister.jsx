import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "./AuthLayout";
import { registerUser } from "../../api";
import Toast from "../../utils/toast";

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password
      };
      await registerUser(userData);
      Toast.success("Registration successful! Please login.");
      // Small delay to let user see toast before redirect
      setTimeout(() => navigate("/user-login"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed. Please try again.";

      // Check if email already registered
      if (errorMessage.toLowerCase().includes("email already registered")) {
        Toast.error("This email is already registered. Please login instead.", {
          duration: 4000
        });
        // Optionally redirect to login after a delay
        setTimeout(() => {
          if (window.confirm("This email is already registered. Would you like to go to the login page?")) {
            navigate("/user-login");
          }
        }, 2000);
      } else {
        Toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="You're a USER"
      videoSrc="https://cdn.pixabay.com/video/2024/02/21/201308-915375262.mp4"
      posterSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d321?q=80&w=1920&auto=format&fit=crop"
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="row g-2 mb-3"
        >
          <div className="col-md-6">
            <label className="form-label-glass">First Name</label>
            <input
              className="auth-glass-input"
              placeholder="John"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-glass">Last Name</label>
            <input
              className="auth-glass-input"
              placeholder="Doe"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-3"
        >
          <label className="form-label-glass">Email address</label>
          <input
            className="auth-glass-input"
            placeholder="name@example.com"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-3"
        >
          <label className="form-label-glass">Phone Number</label>
          <input
            className="auth-glass-input"
            placeholder="+91..."
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-4"
        >
          <label className="form-label-glass">Secure Password</label>
          <input
            className="auth-glass-input"
            placeholder="••••••••"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          type="submit"
          className="btn-vibrant-sunset w-100 mb-3 shadow-sm py-2 px-3 small"
          disabled={loading}
        >
          Create User Account
        </motion.button>

        <div className="text-center pt-3 mt-4 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <p className="mb-0 text-white-50 small">
            Already have an account?{" "}
            <span
              className="fw-bold"
              style={{
                color: "#f97316",
                cursor: "pointer",
              }}
              onClick={() => navigate("/user-login")}
            >
              Sign In Here
            </span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default UserRegister;
