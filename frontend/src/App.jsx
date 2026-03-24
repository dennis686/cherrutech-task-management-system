import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Board from "./pages/Board";
import Calendar from "./pages/Calendar"

import ProtectedRouted from "./components/ProtectedRouted";
import Layout from "./components/Layout";

function App() {
  const [tasks, setTasks] = useState([]);

  const addTask = (taskData) => {
    setTasks((prev) => [
      ...prev,
      { ...taskData, id: Date.now() },
    ]);
  };

  const toggleTaskCompleted = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          <ProtectedRouted>
            <Layout />
          </ProtectedRouted>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path ="/tasks" element={<Tasks />} />

        <Route
          path="/tasks"
          element={
            <Tasks
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={toggleTaskCompleted}
              onDeleteTask={deleteTask}
            />
          }
        />

        <Route path="/analytics" element={<Analytics />} />
        <Route path="/board" element={<Board />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>

    </Routes>
  );
}

export default App;