import React from 'react';
import { FaEdit, FaSave, FaExclamationCircle } from 'react-icons/fa';
import { Task, User } from '../../types/Types';

interface TaskDescriptionBlockProps {
  task: Task;
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
  setEditedTitle: (v: string) => void;
  setEditedDescription: (v: string) => void;
  setIsEditing: (v: boolean) => void;
  handleSaveTask: () => void;
  isReadOnly: boolean;
  currentUser: User | null;
}
const TaskDescriptionBlock: React.FC<TaskDescriptionBlockProps> = ({
  task, isEditing, editedTitle, editedDescription, setEditedTitle, setEditedDescription, setIsEditing, handleSaveTask, isReadOnly, currentUser
}) => (
  <div className="task-detail__description-container">
    {isEditing ? (
      <div className="task-detail__edit-container">
        <input
          type="text"
          value={editedTitle}
          onChange={e => setEditedTitle(e.target.value)}
          placeholder="Название задачи"
          className="task-detail__title-input"
          disabled={isReadOnly || currentUser?.id !== task.created_by.id}
        />
        <textarea
          value={editedDescription}
          onChange={e => setEditedDescription(e.target.value)}
          placeholder="Описание задачи"
          className="task-detail__description-textarea"
          disabled={isReadOnly || currentUser?.id !== task.created_by.id}
        />
        {currentUser?.id === task.created_by.id && !isReadOnly && (
          <div className="task-detail__edit-actions">
            <button onClick={handleSaveTask} className="task-detail__save-btn"><FaSave /> Сохранить</button>
            <button onClick={() => setIsEditing(false)} className="task-detail__cancel-btn">Отмена</button>
          </div>
        )}
      </div>
    ) : (
      <div className="task-detail__description">
        <h1 className="task-detail__title">{task.title}</h1>
        {task.is_overdue && <div className="task-detail__overdue-badge"><FaExclamationCircle /> Просрочена</div>}
        <h3>Описание:</h3>
        <p className="task-detail__description-text">{task.description || '👉 Нет описания'}</p>
        {currentUser?.id === task.created_by.id && !isReadOnly && (
          <button onClick={() => setIsEditing(true)} className="task-detail__edit-description-btn"><FaEdit /> Редактировать</button>
        )}
      </div>
    )}
  </div>
);
export default TaskDescriptionBlock;