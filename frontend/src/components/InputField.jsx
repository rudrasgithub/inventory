import React, { useState } from "react";
import "../css/InputField.css";

const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  isPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-field-group">
      {label && (
        <label htmlFor={id} className="input-field-label">
          {label}
        </label>
      )}
      <div className="input-field-wrapper">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="input-field"
        />
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="toggle-password-btn"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
