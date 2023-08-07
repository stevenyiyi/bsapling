import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";
const header = () => {
  return (
    <div className="sidebar">
      <NavLink to="/my_devices">我的设备</NavLink>
      <NavLink to="/my_subusers">我的用户</NavLink>
    </div>
  );
};

export default header;
