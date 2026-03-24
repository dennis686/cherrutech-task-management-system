import React, { useState } from 'react';
import './TaskItem.css';

function TaskItem({ task, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleToggleComplete = async () => {
    await onUpdateTask(task.id, {
      ...task,
      completed: !task.completed,
    });
  };

  const handleSaveEdit = async () => {
    if (editedTitle.trim()) {
      await onUpdateTask(task.id, {
        ...task,
        title: editedTitle.trim(),
        description: editedDescription.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-checkbox-and-title">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            className="task-checkbox"
          />
          {isEditing ? (
            <div className="task-edit-input">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="edit-title-input"
              />
            </div>
          ) : (
            <h3 className="task-title">{task.title}</h3>
          )}
        </div>
        <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="edit-description-input"
        />
      ) : task.description ? (
        <p className="task-description">{task.description}</p>
      ) : null}

      <div className="task-footer">
        <div className="task-meta">
          {task.due_date && (
            <span className="task-due-date">📅 {formatDate(task.due_date)}</span>
          )}
          <span className="task-date">
            Created: {formatDate(task.created_at)}
          </span>
        </div>
        
        <div className="task-actions">
          {isEditing ? (
            <>
              <button onClick={handleSaveEdit} className="btn btn-success">
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-cancel">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                Edit
              </button>
              <button onClick={() => onDeleteTask(task.id)} className="btn btn-delete">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
