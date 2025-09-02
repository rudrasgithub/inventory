import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../css/OTPVerification.css";
import InputField from "./InputField";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function OTPVerification({ email }) { // Accept email as a prop
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) { // Ensure only valid 6-digit numeric OTPs are allowed
      setOtp(value);
    } else {
      toast.error("OTP must be a 6-digit number."); // Show error for invalid input
    }
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true); // Set loading to true
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }), // Include email in the request body
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("tempToken", data.tempToken); // Store tempToken in local storage
        toast.success("OTP verified successfully!");
        navigate("/reset-password"); // Navigate to Reset Password page
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-form-panel">
        <div className="otp-form-content">
          <div className="otp-form-header">
            <h1>Company name</h1>
            <div className="otp-instructions">
              <p>We've sent a 6-digit OTP to your registered email. Please enter it below to verify your account.</p>
            </div>
          </div>

          <div className="otp-form-body">
            <div className="otp-input-group">
              <label htmlFor="otp">OTP</label>
              <InputField
                id="otp"
                type="text"
                placeholder="xxxx05"
                value={otp}
                onChange={handleOtpChange}
              />
            </div>

            <button
              className="otp-confirm-button"
              disabled={isLoading || otp.length !== 6} // Disable button when loading
              style={{
                backgroundColor: isLoading || otp.length !== 6 ? "#8897ad" : "#242531",
                cursor: isLoading || otp.length !== 6 ? "not-allowed" : "pointer",
              }}
              onClick={handleOtpSubmit} // Attach the OTP submit handler
            >
              {isLoading ? "Verifying..." : "Confirm"} {/* Show loading text */}
            </button>
          </div>
        </div>
      </div>

      <div className="otp-illustration-panel">
        <div className="otp-illustration-container">
          <img
            src="/Startup.png"
            alt="Person riding rocket ship in space"
          />
        </div>
      </div>
    </div>
  );
}
