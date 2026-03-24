import React, { useState, useEffect } from "react";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import api from "../api/api";
import "./Tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // define and call immediately inside useEffect
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        // Ensure tasks is always an array
        const tasksArray = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setTasks(tasksArray);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
        setLoading(false);
      }
    };

    fetchTasks(); // ✅ call immediately
  }, []); // run once on mount

  const addTask = async (task) => {
    try {
      const response = await api.post("/tasks", task);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const toggleTaskCompleted = async (id) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === id);
      const response = await api.put(`/tasks/${id}`, {
        ...taskToUpdate,
        completed: !taskToUpdate.completed,
      });
      setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="tasks-page">
      <h1>📝 My Tasks</h1>
      <TaskForm onAddTask={addTask} />
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList
          tasks={tasks}
          onUpdateTask={toggleTaskCompleted}
          onDeleteTask={deleteTask}
        />
      )}
    </div>
  );
}

export default Tasks;