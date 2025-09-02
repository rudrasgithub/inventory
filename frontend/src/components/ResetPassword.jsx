import React, { useState } from "react";
import "../css/ResetPassword.css";
import InputField from "./InputField";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const tempToken = localStorage.getItem("tempToken");

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password, confirmPassword, tempToken }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        window.location.href = "/login";
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("Failed to reset password.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-panel">
        <div className="reset-password-form-wrapper">
          <h1 className="reset-password-form-title">Create New Password</h1>
          <p className="reset-password-form-subtitle">
            Today is a new day. It's your day.
            <br />
            You shape it. Sign in to start managing your projects.
          </p>

          <form className="reset-password-form-body">
            <div className="reset-password-form-group">
              <InputField
                id="password"
                label="Enter New Password"
                type="password"
                isPassword={true}
                placeholder="at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="reset-password-form-group">
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                isPassword={true}
                placeholder="at least 8 characters"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="reset-password-submit-btn"
              disabled={loading || !password || password !== confirmPassword || password.length < 8 || confirmPassword.length < 8}
              style={{
                backgroundColor: !loading && password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword ? "#242531" : "#8897ad",
                cursor: (!loading && password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword) ? "pointer" : "not-allowed",
              }}
              onClick={handleReset}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <div className="reset-password-illustration-panel">
        <div className="reset-password-illustration-wrapper">
          <h2 className="reset-password-illustration-title">
            Welcome to
            <br /> Inventory
          </h2>
          <img src="/welcome.svg" />
        </div>
        <img
          src="/Illustration.png"
          alt="Business analytics illustration"
          className="reset-password-illustration-image"
        />
      </div>
    </div>
  );
}
