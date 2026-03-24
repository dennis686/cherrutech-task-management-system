import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Analytics.css";

function Analytics() {
  const weeklyData = [
    { week: "W1", onTime: 2, late: 5 },
    { week: "W2", onTime: 1, late: 6 },
    { week: "W3", onTime: 3, late: 7 },
    { week: "W4", onTime: 2, late: 8 },
  ];

  const summaryData = [
    { name: "On Time", value: 8 },
    { name: "Late", value: 26 },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Analytics Dashboard</h1>
      <p className="analytics-subtitle">
        This user works consistently but often misses deadlines, showing poor time management.
      </p>

      <div className="analytics-grid">

        {/* Bar Chart */}
        <div className="analytics-card">
          <h3>Weekly Task Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" fill="#22c55e" />
              <Bar dataKey="late" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="analytics-card">
          <h3>Overall Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={summaryData} dataKey="value" outerRadius={100} label>
                {summaryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default Analytics;