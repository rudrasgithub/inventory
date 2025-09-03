"use client";

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../css/AuthForm.css";
import InputField from "./InputField";
import { AuthContext } from '../Context/ContextProvider';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function AuthForm({ mode = "login" }) {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === "login") {
          console.log("Login successful - showing toast"); // Debug log
          toast.success("Logged in successfully!");

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser({ ...data.user, token: data.token });
          console.log("Navigating to home page"); // Debug log
          navigate("/");
        } else {
          toast.success("Signed up successfully, please login!");
          navigate("/login");
        }
      } else {

        const errorMessage = data.message || (mode === "login" ? "Login failed" : "Registration failed");
        console.log("Login error - showing error toast:", errorMessage); // Debug log
        toast.error(errorMessage);
        console.error("Auth error:", { status: response.status, message: data.message });
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === "signup";
  const { email, password, confirmPassword } = formData;

  const isEmailValid = email && /^[^\s@]+@[^\s@]+\.com$/.test(email); // Updated to require '.com' fully entered
  const isPasswordValid = password && password.length >= 8;
  const isConfirmPasswordValid = isSignUp ? confirmPassword === password : true;

  const isFormValid = isEmailValid && isPasswordValid && isConfirmPasswordValid;

  return (
    <div className="authform-auth-container">
      <div className="authform-auth-form-panel">
        <div className="authform-form-wrapper">
          <h1 className="authform-form-title">
            {mode === "login" ? "Log in to your account" : "Create an account"}
          </h1>
          <p className="authform-form-subtitle">
            {mode === "login"
              ? "Welcome back! Please enter your details."
              : "Start inventory management."}
          </p>

          <form onSubmit={handleSubmit} className="authform-form-body">
            {mode === "signup" && (
              <div className="authform-form-group">
                <label htmlFor="name" className="authform-form-label">
                  Name
                </label>
                <InputField
                  id="name"
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="authform-form-group">
              <label htmlFor="email" className="authform-form-label">Email</label>
              <InputField
                id="email"
                type="email"
                placeholder="Example@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="authform-form-group" style={{ position: "relative" }}>
              <label htmlFor="password" className="authform-form-label">
                Password
              </label>
              <InputField
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="at least 8 characters"
                value={formData.password}
                onChange={handleInputChange}
              />
              <img
                src={showPassword ? "/Eye.svg" : "/EyeOff.svg"}
                alt={showPassword ? "Hide Password" : "Show Password"}
                style={{
                  position: "absolute",
                  right: "75px",
                  top: "67%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {mode === "signup" && (
              <div className="authform-form-group" style={{ position: "relative" }}>
                <label htmlFor="confirmPassword" className="authform-form-label">
                  Confirm Password
                </label>
                <InputField
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{ paddingRight: "50px" }}
                />
                <img
                  src={showConfirmPassword ? "/Eye.svg" : "/EyeOff.svg"}
                  alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                  style={{
                    position: "absolute",
                    right: "75px",
                    top: "67%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            )}

            <div className="authform-forgot-password-wrapper">
              {mode === "login" && (
                <Link
                  to={"/forgot-password"}
                  className="authform-forgot-password"
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            <button
              type="submit"
              className="authform-submit-btn"
              disabled={!isFormValid || loading}
              style={{
                backgroundColor: isFormValid && !loading ? "#242531" : "#8897ad",
                cursor: isFormValid && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (mode === "login" ? "Signing in..." : "Signing up...") : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <div className="authform-form-footer">
            <span>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account?"}
            </span>
            <button
              className="authform-switch-auth"
              onClick={() =>
                navigate(mode === "login" ? "/signup" : "/login")
              }
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      <div className="authform-auth-illustration-panel">
        <div className="authform-illustration-wrapper">
          <h2 className="authform-illustration-title">
            Welcome to
            <br /> Inventory
          </h2>
          <img src="/welcome.svg" />
        </div>
        <img
          src="/Illustration.png"
          alt="Business analytics illustration"
          className="authform-illustration-image"
        />
      </div>
    </div>
  );
}
