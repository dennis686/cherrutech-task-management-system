import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./Board.css";
import api from "../api/api"; // your Axios setup

const statuses = ["Todo", "In Progress", "Done"];

function Board() {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/");
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setTasks(taskData);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  // Handle drag end
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = parseInt(draggableId);

    // Update task status in frontend
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: destination.droppableId } : t
      )
    );

    // Update backend
    try {
      await api.put(`/tasks/${taskId}/`, {
        status: destination.droppableId,
      });
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  return (
    <div className="board-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        {statuses.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div
                className="board-column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2>{status}</h2>

                {tasks
                  .filter((task) => task.status === status)
                  .map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className={`board-task ${task.priority?.toLowerCase()}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <strong>{task.title}</strong>
                          <p>Priority: {task.priority}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}

                <button className="add-task-btn">+ Add Task</button>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
}

export default Board;