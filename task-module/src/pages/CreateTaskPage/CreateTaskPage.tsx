import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setTitle, setDescription, setPriority, resetForm } from '../../redux/createTaskFormSlice';
import { createTask } from '../../api/tasksAddAPI';
import { useNavigate } from 'react-router-dom';
import '../../components/TaskList/TaskList.css'; // стиль можно будет потом вынести отдельно

const CreateTaskPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { title, description, priority } = useAppSelector(state => state.createTaskForm);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTask({
        title,
        description,
        priority,
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

  return (
    <div className="task-detail-container">
      <h2 className="task-title">Создать новую задачу</h2>
      <form onSubmit={handleSubmit} className="edit-task-inputs">
        <input
          className="input-field"
          type="text"
          placeholder="Название задачи"
          value={title}
          onChange={(e) => dispatch(setTitle(e.target.value))}
          required
        />
        <textarea
          className="input-field"
          placeholder="Описание задачи"
          value={description}
          onChange={(e) => dispatch(setDescription(e.target.value))}
          required
        />
        <select
          className="task-select"
          value={priority}
          onChange={(e) => dispatch(setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical'))}
        >
          <option value="low">Низкий приоритет</option>
          <option value="medium">Средний приоритет</option>
          <option value="high">Высокий приоритет</option>
          <option value="critical">Критический</option>
        </select>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="submit" className="save-task-btn" disabled={loading}>
            {loading ? 'Создание...' : 'Создать задачу'}
          </button>
          <button type="button" className="cancel-task-btn" onClick={handleGoBack} disabled={loading}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
