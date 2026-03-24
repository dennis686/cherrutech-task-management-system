import React from "react";
import "./TaskList.css";

function TaskList({ tasks }) {
  // Example fallback (so you ALWAYS see something)
  const sampleTasks = [
    {
      id: 1,
      title: "Design Dashboard UI",
      status: "completed",
      priority: "high",
    },
    {
      id: 2,
      title: "Fix API Integration",
      status: "todo",
      priority: "medium",
    },
    {
      id: 3,
      title: "Test User Authentication",
      status: "completed",
      priority: "low",
    },
  ];

  const displayTasks =
    Array.isArray(tasks) && tasks.length > 0 ? tasks : sampleTasks;

  return (
    <div className="task-container">
      {displayTasks.map((task) => (
        <div className="task-row" key={task.id}>
          
          {/* Status Icon */}
          <div className="task-icon">
            {task.status === "completed" ? "✅" : "⏳"}
          </div>

          {/* Task Content */}
          <div className="task-content">
            <h4>{task.title}</h4>
            <span className={`priority ${task.priority}`}>
              {task.priority}
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`status ${
              task.status === "completed" ? "done" : "pending"
            }`}
          >
            {task.status === "completed" ? "Completed" : "Pending"}
          </div>

        </div>
      ))}
    </div>
  );
}

export default TaskList;