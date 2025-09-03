import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from '../Context/ContextProvider';
import "../css/Sidebar.css";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const navigation = [
    { icon: "/home.svg", label: "Home", path: "/" },
    { icon: "/box-icon.svg", label: "Product", path: "/product" },
    { icon: "/invoice.svg", label: "Invoice", path: "/invoice" },
    { icon: "/statistics.svg", label: "Statistics", path: "/statistics" },
    { icon: "/settings.svg", label: "Setting", path: "/setting" },
  ];

  const getUserInitial = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.name) {
      return user.name;
    }
    return "User";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-sidebar">
          <img src="/product-logo.svg" alt="Logo" className="logo-image" />
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul>
          {navigation.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <img src={item.icon} alt={item.label} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-btm">
        <div className="profile" onClick={() => navigate('/setting')}>
          <div className="avatar">{getUserInitial()}</div>
          <div className="profile-name">{getUserName()}</div>
        </div>
      </div>
    </aside>
  );
}
