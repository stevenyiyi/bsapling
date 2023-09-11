import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";
const header = () => {
  return (
    <div className="sidebar">
      <NavLink to="/my_schools">学校信息</NavLink>
      <NavLink to="/my_teachers">教师信息</NavLink>
      <NavLink to="my_classes">班级信息</NavLink>
      <NavLink to="my_students">学生信息</NavLink>
      <NavLink to="recipe_info">食谱信息</NavLink>
      <NavLink to="/my_devices">我的设备</NavLink>
      <NavLink to="/my_subusers">我的用户</NavLink>
    </div>
  );
};

export default header;
