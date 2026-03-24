import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowTrendUp,
  FaClock,
  FaExclamationTriangle,
  FaListUl,
  FaSearch,
  FaSlidersH,
  FaSpinner,
} from "react-icons/fa6";
import "./Dashboard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const API_URL = "http://127.0.0.1:8000/api/tasks/";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const taskData = Array.isArray(data) ? data : data.results || [];
        setTasks(taskData);
      } catch (err) {
        console.error(err);
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  const normalizedTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        status: (task.status || "").toLowerCase(),
        priority: (task.priority || "").toLowerCase(),
      })),
    [tasks]
  );

  const totalTasks = normalizedTasks.length;
  const inProgress = normalizedTasks.filter((t) =>
    ["in progress", "in_progress", "doing", "pending"].includes(t.status)
  ).length;
  const completed = normalizedTasks.filter((t) =>
    ["done", "completed"].includes(t.status)
  ).length;
  const overdue = normalizedTasks.filter(
    (t) =>
      !["done", "completed"].includes(t.status) &&
      (t.due_date || t.dueDate || t.deadline)
  ).length;

  const backlogTasks = normalizedTasks.filter((t) =>
    ["backlog", "todo", "to do"].includes(t.status)
  );
  const todoTasks = normalizedTasks.filter((t) =>
    ["todo", "to do", "in progress", "in_progress", "doing"].includes(t.status)
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <button className="toolbar-filter-btn" type="button" aria-label="Filter tasks">
          <FaSlidersH />
        </button>
        <div className="dashboard-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search tasks..." />
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-title">Total Tasks</p>
            <h2>{totalTasks}</h2>
            <p className="stat-subtitle">Across all projects</p>
            <p className="stat-trend positive">+12% vs last week</p>
          </div>
          <span className="stat-icon mint">
            <FaListUl />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-title">In Progress</p>
            <h2>{inProgress}</h2>
            <p className="stat-subtitle">Currently active</p>
            <p className="stat-trend positive">+8% vs last week</p>
          </div>
          <span className="stat-icon blue">
            <FaSpinner />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-title">Completed</p>
            <h2>{completed}</h2>
            <p className="stat-subtitle">This sprint</p>
            <p className="stat-trend positive">+24% vs last week</p>
          </div>
          <span className="stat-icon mint">
            <FaClock />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-title">Overdue</p>
            <h2>{overdue}</h2>
            <p className="stat-subtitle">Needs attention</p>
            <p className="stat-trend negative">-5% vs last week</p>
          </div>
          <span className="stat-icon rose">
            <FaExclamationTriangle />
          </span>
        </div>
      </div>

      <div className="board-header">
        <h2>Board View</h2>
        <button className="board-trend-btn" type="button">
          <FaArrowTrendUp />
        </button>
      </div>

      <div className="board-columns">
        <section className="board-column-card">
          <h3>
            <span className="dot gray"></span>
            Backlog
            <span className="count">{backlogTasks.length}</span>
          </h3>
          {backlogTasks.length === 0 ? (
            <div className="task-pill">No tasks</div>
          ) : (
            backlogTasks.slice(0, 3).map((task) => (
              <div className="task-pill" key={task.id}>
                <span className="task-code">TASK-{String(task.id).padStart(3, "0")}</span>
                <span className="priority-badge low">{task.priority || "low"}</span>
              </div>
            ))
          )}
        </section>

        <section className="board-column-card">
          <h3>
            <span className="dot blue"></span>
            To Do
            <span className="count">{todoTasks.length}</span>
          </h3>
          {todoTasks.length === 0 ? (
            <div className="task-pill">No tasks</div>
          ) : (
            todoTasks.slice(0, 3).map((task) => (
              <div className="task-pill" key={task.id}>
                <span className="task-code">TASK-{String(task.id).padStart(3, "0")}</span>
                <span className="priority-badge medium">{task.priority || "medium"}</span>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;