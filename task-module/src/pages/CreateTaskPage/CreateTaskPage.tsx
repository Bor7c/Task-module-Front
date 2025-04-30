import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setTitle, setDescription, setPriority, setDeadline, resetForm } from '../../redux/createTaskFormSlice';
import { createTask } from '../../api/tasksAddAPI';
import { useNavigate } from 'react-router-dom';
import './CreateTaskPage.css';

const CreateTaskPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { title, description, priority, deadline } = useAppSelector(state => state.createTaskForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Название задачи не может быть пустым');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await createTask({
        title,
        description,
        priority,
        deadline: deadline || undefined, // Если deadline пустой, не отправляем его
      });
      dispatch(resetForm());
      navigate('/'); // Редирект на главную после успешного создания
    } catch (err: any) {
      console.error('Ошибка при создании задачи:', err);
      setError(err.response?.data?.detail || 'Ошибка при создании задачи. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Возвращаемся назад на одну страницу
  };

  // Определяем класс индикатора приоритета
  const getPriorityClass = () => {
    switch(priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return 'priority-medium';
    }
  };

  // Форматируем дату для поля ввода
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Формат "YYYY-MM-DDThh:mm"
    } catch(e) {
      return '';
    }
  };

  return (
    <div className="create-task-container">
      <h2 className="create-task-title">Создать новую задачу</h2>
      
      <form onSubmit={handleSubmit} className="create-task-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Название задачи</label>
          <input
            id="title"
            className="input-field"
            type="text"
            placeholder="Введите название задачи"
            value={title}
            onChange={(e) => dispatch(setTitle(e.target.value))}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">Описание задачи</label>
          <textarea
            id="description"
            className="input-field"
            placeholder="Введите подробное описание задачи"
            value={description}
            onChange={(e) => dispatch(setDescription(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Приоритет
            <span className={`priority-indicator ${getPriorityClass()}`}></span>
          </label>
          <select
            id="priority"
            className="priority-select"
            value={priority}
            onChange={(e) => dispatch(setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical'))}
          >
            <option value="low">Низкий приоритет</option>
            <option value="medium">Средний приоритет</option>
            <option value="high">Высокий приоритет</option>
            <option value="critical">Критический</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="deadline" className="form-label">
            Срок выполнения
            <span className="optional-badge">Необязательно</span>
          </label>
          <input
            id="deadline"
            className="input-field date-input"
            type="datetime-local"
            value={formatDateForInput(deadline)}
            onChange={(e) => dispatch(setDeadline(e.target.value ? new Date(e.target.value).toISOString() : null))}
            min={new Date().toISOString().slice(0, 16)} // Минимальная дата - сегодня
          />
          <small className="field-hint">Выберите дату и время завершения задачи</small>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="action-buttons">
          <button type="submit" className="create-button" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Создание...' : 'Создать задачу'}
          </button>
          <button 
            type="button" 
            className="back-button" 
            onClick={handleGoBack} 
            disabled={loading}
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;