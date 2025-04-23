import React, { useState } from 'react';
import { Task } from '../../../types/Task';
import { User } from '../../../types/User';
import TaskPriority from '../TaskPriority/TaskPriority';
import TaskStatusControls from '../TaskStatusControls/TaskStatusControls';
import './TaskEditView.css';

type TaskEditViewProps = {
  task: Task;
  user: User | null;
  onTitleSave: (title: string) => void;
  onDescriptionSave: (description: string) => void;
  onPriorityChange: (priority: string) => void;
  onStatusChange: (status: string) => void;
  onTakeTask: () => void;
  onReleaseTask: () => void;
  onMarkSolved: () => void;
  onMarkClosed: () => void;
};

const TaskEditView: React.FC<TaskEditViewProps> = ({
  task,
  user,
  onTitleSave,
  onDescriptionSave,
  onPriorityChange,
  onStatusChange,
  onTakeTask,
  onReleaseTask,
  onMarkSolved,
  onMarkClosed,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleTitleSave = () => {
    onTitleSave(editedTitle);
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    onDescriptionSave(editedDescription);
    setIsEditingDescription(false);
  };

  return (
    <div className="task-edit-container">
      {/* Header Section */}
      <div className="task-header-section">
        {isEditingTitle ? (
          <div className="edit-title-container">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="title-input"
              autoFocus
            />
            <div className="edit-actions">
              <button onClick={handleTitleSave} className="save-btn">
                Сохранить
              </button>
              <button 
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle(task.title);
                }} 
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="title-display" onClick={() => user?.id === task.created_by.id && setIsEditingTitle(true)}>
            <h1 className="task-title">
              {task.title}
              {user?.id === task.created_by.id && (
                <button className="edit-icon-btn">
                  <i className="bi bi-pencil"></i>
                </button>
              )}
            </h1>
          </div>
        )}

        <div className="task-meta-row">
          <div className="priority-status-container">
            <TaskPriority 
              task={task} 
              user={user} 
              onPriorityChange={onPriorityChange} 
            />
            <div className="task-status">
              <TaskStatusControls
                task={task}
                user={user}
                onStatusChange={onStatusChange}
                onTakeTask={onTakeTask}
                onReleaseTask={onReleaseTask}
                onMarkSolved={onMarkSolved}
                onMarkClosed={onMarkClosed}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="description-section">
        <div className="section-header">
          <h3>Описание</h3>
          {user?.id === task.created_by.id && !isEditingDescription && (
            <button 
              onClick={() => setIsEditingDescription(true)}
              className="edit-btn"
            >
              Редактировать
            </button>
          )}
        </div>

        {isEditingDescription ? (
          <div className="edit-description-container">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="description-textarea"
              rows={6}
            />
            <div className="edit-actions">
              <button 
                onClick={handleDescriptionSave}
                disabled={!editedDescription.trim()}
                className="save-btn"
              >
                Сохранить
              </button>
              <button 
                onClick={() => {
                  setIsEditingDescription(false);
                  setEditedDescription(task.description || '');
                }} 
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="description-content">
            {task.description ? (
              <p>{task.description}</p>
            ) : (
              <p className="no-description">Нет описания</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskEditView;