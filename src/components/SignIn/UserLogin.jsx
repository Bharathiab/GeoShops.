import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "./AuthLayout";
import { loginUser, sendOtp, loginWithOtp } from "../../api";
import Toast from "../../utils/toast";

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    otp: "",
    phoneNumber: "",
    countryCode: "+91"
  });
  const [showOtpField, setShowOtpField] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isOtpLogin) {
        if (!showOtpField) {
          // Send OTP
          const cleanPhone = formData.phoneNumber.replace(/[^\d]/g, "");
          const cleanPhoneNumber = formData.countryCode + cleanPhone;

          await sendOtp({
            email: formData.username,
            phoneNumber: cleanPhoneNumber,
            role: "USER"
          });
          setShowOtpField(true);
          Toast.success("OTP sent successfully!");
        } else {
          // Verify and login
          const cleanPhone = formData.phoneNumber.replace(/[^\d]/g, "");
          const combinedPhoneNumber = formData.countryCode + cleanPhone;

          const response = await loginWithOtp({
            email: formData.username,
            phoneNumber: combinedPhoneNumber,
            otp: formData.otp,
            role: "USER"
          });
          handleLoginSuccess(response);
        }
      } else {
        const credentials = {
          email: formData.username,
          password: formData.password
        };
        const response = await loginUser(credentials);
        handleLoginSuccess(response);
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (response) => {
    if (response.success && response.data) {
      localStorage.setItem(
        "userLoginData",
        JSON.stringify({ username: response.data.name, userId: response.data.userId })
      );
      Toast.success("Login successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/user"), 1500);
    } else {
      navigate("/user");
    }
  };

  return (
    <AuthLayout
      title="USER Login"
      videoSrc="https://cdn.pixabay.com/video/2024/02/21/201308-915375262.mp4"
      posterSrc="https://images.unsplash.com/photo-1507525428034-b723cf961d321?q=80&w=1920&auto=format&fit=crop"
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-3"
        >
          <label className="form-label-glass">Email Address</label>
          <input
            className="auth-glass-input"
            placeholder="name@example.com"
            name="username"
            type="email"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </motion.div>

        {!isOtpLogin ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-3"
          >
            <label className="form-label-glass">Password</label>
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-3"
          >
            <label className="form-label-glass">Mobile Verification</label>
            <div className="d-flex mb-2">
              <select
                className="auth-glass-input"
                style={{ width: "95px", padding: "0.7rem 5px" }}
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                disabled={showOtpField}
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input
                className="auth-glass-input ms-2"
                placeholder="Phone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                disabled={showOtpField}
              />
            </div>
            {showOtpField && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3"
              >
                <label className="form-label-glass text-center d-block">OTP Code</label>
                <input
                  className="auth-glass-input"
                  placeholder="000000"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  style={{ letterSpacing: "0.8em", textAlign: "center", fontSize: "1.3rem" }}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          type="submit"
          className="btn-vibrant-sunset w-100 mb-3 shadow-sm py-2 px-3 small"
          disabled={loading}
        >
          {loading ? "Please wait..." : (isOtpLogin ? (showOtpField ? "Verify" : "Get OTP") : "Sign In")}
        </motion.button>

        <div className="text-center mb-4">
          <span
            style={{
              color: "#fb923c",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              textDecoration: "underline",
              opacity: 0.8
            }}
            onClick={() => {
              setIsOtpLogin(!isOtpLogin);
              setShowOtpField(false);
            }}
          >
            {isOtpLogin ? "Use Password Login Instead" : "Login with Phone OTP"}
          </span>
        </div>

        <div className="text-center pt-3 mt-4 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <p className="mb-0 text-white-50 small">
            Don't have an account?{" "}
            <span
              className="fw-bold"
              style={{
                color: "var(--primary-color)",
                cursor: "pointer",
              }}
              onClick={() => navigate("/user-register")}
            >
              Sign Up Now
            </span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;
