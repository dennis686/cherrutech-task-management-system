import React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import {
  FaBorderAll,
  FaListCheck,
  FaTableColumns,
  FaCalendarDays,
  FaChartBar,
  FaFolderOpen,
  FaUsers,
  FaGear,
} from "react-icons/fa6";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">⚡ TaskFlow</div>

      <div className="menu">
        <p className="menu-title">Navigation</p>

        <NavLink to="/" className="menu-item">
          <FaBorderAll /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/tasks" className="menu-item">
          <FaListCheck /> <span>My Tasks</span>
        </NavLink>

        <NavLink to="/board" className="menu-item">
          <FaTableColumns /> <span>Board</span>
        </NavLink>

        <NavLink to="/calendar" className="menu-item">
          <FaCalendarDays /> <span>Calendar</span>
        </NavLink>

        <NavLink to="/analytics" className="menu-item">
          <FaChartBar /> <span>Analytics</span>
        </NavLink>

        <p className="menu-title workspace-title">Workspace</p>

        <div className="menu-item secondary-item">
          <FaFolderOpen /> <span>Projects</span>
        </div>

        <div className="menu-item secondary-item">
          <FaUsers /> <span>Team</span>
        </div>

        <div className="menu-item secondary-item">
          <FaGear /> <span>Settings</span>
        </div>
      </div>

      <div className="profile">
        <div className="avatar">A</div>
        <div>
          <p>Alex Chen</p>
          <span>alex@taskflow.io</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;