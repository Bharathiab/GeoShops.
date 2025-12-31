import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "./AuthLayout";
import { loginHost, sendOtp, loginWithOtp } from "../../api";
import Toast from "../../utils/toast";

const HostLogin = () => {
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
            role: "HOST"
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
            role: "HOST"
          });
          handleLoginSuccess(response);
        }
      } else {
        const credentials = {
          email: formData.username,
          password: formData.password
        };
        const response = await loginHost(credentials);
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
      // Store login details in localStorage for profile
      localStorage.setItem(
        "hostLoginData",
        JSON.stringify({ username: response.data.name, hostId: response.data.hostId })
      );

      Toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        if (response.data.subscriptionSelected) {
          navigate("/host/dashboard");
        } else {
          navigate("/host/subscription");
        }
      }, 1500);
    }
  };

  return (
    <AuthLayout
      title="HOST Login"
      videoSrc="https://cdn.pixabay.com/video/2021/10/05/90875-629483572_large.mp4" // Aurora Borealis Alt
      posterSrc="https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1280&q=80"
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-3"
        >
          <label className="form-label-glass">Host Email</label>
          <input
            className="auth-glass-input"
            placeholder="host@company.com"
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
            <label className="form-label-glass">Mobile Access</label>
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
                <label className="form-label-glass text-center d-block">Verification Code</label>
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
          className="btn w-100 mb-3 shadow-sm py-2"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            border: "none",
            fontWeight: "700",
            borderRadius: "0.75rem",
            fontSize: "0.9rem",
            padding: "0.6rem 1rem",
            transition: "all 0.3s ease"
          }}
          disabled={loading}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 15px rgba(234, 88, 12, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {loading ? "Authenticating..." : (isOtpLogin ? (showOtpField ? "Verify Host" : "Get Code") : "Host Sign In")}
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
            {isOtpLogin ? "Login with Password" : "Login with Phone OTP"}
          </span>
        </div>

        <div className="text-center pt-3 mt-4 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <p className="mb-0 text-white-50 small">
            New Host?{" "}
            <span
              className="fw-bold"
              style={{
                color: "#ea580c",
                cursor: "pointer",
              }}
              onClick={() => navigate("/host-register")}
            >
              Register Your Business
            </span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default HostLogin;
