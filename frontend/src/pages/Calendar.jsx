import React, { useState } from "react";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Example tasks
  const tasks = [
    { date: 5, title: "Submit Report", priority: "high" },
    { date: 12, title: "Meeting", priority: "medium" },
    { date: 18, title: "Code Review", priority: "low" },
    { date: 25, title: "Project Deadline", priority: "high" },
  ];

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.setMonth(currentDate.getMonth() + offset))
    );
  };

  const renderDays = () => {
    const days = [];

    // Empty slots before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={"empty-" + i}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth();

      const dayTasks = tasks.filter((t) => t.date === day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""}`}
        >
          <div className="calendar-date">{day}</div>

          {dayTasks.map((task, i) => (
            <div key={i} className={`calendar-task ${task.priority}`}>
              {task.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <h1>
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </h1>

        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)}>◀</button>
          <button onClick={() => changeMonth(1)}>▶</button>
        </div>
      </div>

      {/* Days of week */}
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-day-name">
            {d}
          </div>
        ))}

        {renderDays()}
      </div>
    </div>
  );
}

export default Calendar;