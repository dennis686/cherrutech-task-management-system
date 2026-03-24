import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function DashboardStats({ tasks = [] }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <p>{pendingTasks}</p>
        </div>

        <div className="stat-card">
          <h3>High Priority</h3>
          <p>{highPriorityTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completion</h3>
          <p>{completionPercentage}%</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="dashboard-links">
        <Link to="/tasks" className="nav-btn">
          View Tasks
        </Link>

        <Link to="/add-task" className="nav-btn">
          Add Task
        </Link>
      </div>
    </div>
  );
}

export default DashboardStats;
