import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Toast from "../../utils/toast";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      // Use the actual backend login
      const { loginAdmin } = await import("../../api");
      const response = await loginAdmin({ email, password });
      
      if (response && response.data) {
        // Store in format expected by GlobalNotificationHandler (needs .id)
        const storageData = {
          id: response.data.adminId, 
          token: response.data.token,
          email: response.data.email,
          name: response.data.name
        };
        localStorage.setItem("adminLoginData", JSON.stringify(storageData));
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
      // Fallback for demo purposes if backend login fails (e.g. if db is empty)
      // BUT this won't help with notifications. Warn user.
      alert("Invalid credentials or backend error. Please ensure Admin exists in DB.");
    }
  };

  return (
    <AuthLayout title="ADMIN Login">
      <form onSubmit={handleLogin}>
        <input className="form-control mb-3" placeholder="Email" required />
        <input
          className="form-control mb-3"
          placeholder="Password"
          type="password"
          required
        />

        <button
          type="submit"
          className="btn w-100"
          style={{ background: "#de5c06ff", color: "white", border: "none" }}
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
