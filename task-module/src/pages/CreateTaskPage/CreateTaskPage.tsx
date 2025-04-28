import React, { useState } from 'react';
import { createTask } from '../../api/tasksAddAPI';
import { useNavigate } from 'react-router-dom';
import '../../components/TaskList/TaskList.css'; // или свой css сделаем потом отдельно

const CreateTaskPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({ title, description, priority });
      navigate('/'); // Переход на главную страницу после создания
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
    }
  };

  return (
    <div className="task-detail-container">
      <h2 className="task-title">Создать новую задачу</h2>
      <form onSubmit={handleSubmit} className="edit-task-inputs">
        <input
          className="input-field"
          type="text"
          placeholder="Название задачи"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="input-field"
          placeholder="Описание задачи"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className="task-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
        >
          <option value="Low">Низкий приоритет</option>
          <option value="Medium">Средний приоритет</option>
          <option value="High">Высокий приоритет</option>
        </select>
        <button type="submit" className="save-task-btn">Создать задачу</button>
      </form>
    </div>
  );
};

export default CreateTaskPage;
