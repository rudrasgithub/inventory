import React, { useState } from "react";
import "../css/ForgotPassword.css";
import InputField from "./InputField";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate(); // Add navigation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && /^[^\s@]+@gmail\.com$/.test(email)) {
      setIsLoading(true); // Set loading to true
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Reset link sent successfully!");
          navigate("/otp-verification"); // Navigate to OTP verification page
        } else {
          toast.error(data.message || "Failed to send reset link.");
        }
      } catch (error) {
        toast.error("Failed to connect to the server.");
        console.error(error);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    } else {
      toast.error("Please enter a valid Gmail address.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="form-panel">
        <div className="form-content">
          <div className="form-header">
            <h1>Company name</h1>
            <p>Please enter your registered email ID to receive an OTP</p>
          </div>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-group-forgot-password">
              <label htmlFor="email">E-mail</label>
              <InputField
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !email || !/^[^\s@]+@gmail\.com$/.test(email)} // Disable button when loading
              style={{
                backgroundColor:
                  isLoading || !email || !/^[^\s@]+@gmail\.com$/.test(email)
                    ? "#8897ad"
                    : "#242531",
                cursor:
                  isLoading || !email || !/^[^\s@]+@gmail\.com$/.test(email)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isLoading ? "Sending..." : "Send Mail"} {/* Show loading text */}
            </button>
          </form>
        </div>
      </div>

      <div className="illustration-panel">
        <div className="illustration-container">
          <img
            src="/women.png"
            alt="Developer illustration with programming languages"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
