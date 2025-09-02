import React, { useState } from "react";
import "../css/ResetPassword.css";
import InputField from "./InputField";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const tempToken = localStorage.getItem("tempToken"); // Retrieve tempToken from local storage

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: password, confirmPassword, tempToken }), // Include tempToken
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        window.location.href = "/login"; // Redirect to login page
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
        <div className="form-content">
          <div className="form-header">
            <h1>Create New Password</h1>
            <p>
              Today is a new day. It's your day. You shape it.
              <br />
              Sign in to start managing your projects.
            </p>
          </div>

          <form className="form-body-reset-password">
            <div className="form-group-reset-password" style={{ position: "relative" }}>
              <label htmlFor="password">Enter New Password</label>
              <InputField
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "40px" }}
              />
              <img
                src={showPassword ? "/Eye.svg" : "/EyeOff.svg"}
                alt={showPassword ? "Hide Password" : "Show Password"}
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: "67%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="form-group-reset-password" style={{ position: "relative" }}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <InputField
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="at least 8 characters"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <img
                src={showConfirmPassword ? "/Eye.svg" : "/EyeOff.svg"}
                alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: "67%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <button
              type="button"
              className="reset-password-btn"
              disabled={loading || !password || password !== confirmPassword || password.length < 8 || confirmPassword.length < 8}
              style={{
                backgroundColor: !loading ? "#242531" : "#8897ad",
                cursor: (!loading && password.length >= 8 && confirmPassword.length >= 8) ? "pointer" : "not-allowed",
              }}
              onClick={handleReset}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <div className="reset-password-illustration-panel">
        <div className="illustration-container">
          <img src="/Group.png" />
        </div>
      </div>
    </div>
  );
}
