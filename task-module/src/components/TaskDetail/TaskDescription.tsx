import React, { useState } from 'react';
import { Task } from '../../types/Task';
import { User } from '../../types/User';

type TaskDescriptionProps = {
  task: Task;
  user: User | null;
  onDescriptionSave: (description: string) => void;
};

const TaskDescription: React.FC<TaskDescriptionProps> = ({ task, user, onDescriptionSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleSave = () => {
    onDescriptionSave(editedDescription);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="description-edit">
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          rows={5}
        />
        <div className="edit-actions">
          <button 
            onClick={handleSave}
            className="save-btn"
          >
            Сохранить
          </button>
          <button 
            onClick={() => setIsEditing(false)} 
            className="cancel-btn"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="task-description">
      <h3>
        Описание
        {user?.id === task.created_by.id && (
          <button 
            onClick={() => setIsEditing(true)}
            className="edit-btn"
            title="Редактировать описание"
          >
            <i className="icon-edit"></i>
          </button>
        )}
      </h3>
      <p>{task.description || 'Нет описания'}</p>
    </div>
  );
};

export default TaskDescription;