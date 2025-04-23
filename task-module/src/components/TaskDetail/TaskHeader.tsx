import React, { useState } from 'react';
import { Task } from '../../types/Task';
import { User } from '../../types/User';

type TaskHeaderProps = {
  task: Task;
  user: User | null;
  onTitleSave: (title: string) => void;
};

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, user, onTitleSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    onTitleSave(editedTitle);
    setIsEditing(false);
  };

  return (
    <div className="title-with-status">
      {isEditing ? (
        <div className="title-edit">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="form-control"
          />
          <div className="edit-actions mt-2">
            <button 
              onClick={handleSave}
              className="btn btn-primary btn-sm"
            >
              Сохранить
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="btn btn-outline-secondary btn-sm ms-2"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <h1 className="task-title mb-0">
            {task.title}
            {user?.id === task.created_by.id && (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-link btn-sm"
                title="Редактировать название"
              >
                <i className="bi bi-pencil"></i>
              </button>
            )}
          </h1>
        </div>
      )}
    </div>
  );
};

export default TaskHeader;