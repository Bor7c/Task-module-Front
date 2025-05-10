import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  loadTaskById,
  updateTaskStatus,
  updateTaskPriority,
  assignTaskResponsible,
  removeResponsible,
  updateTaskTitle,
  updateTaskDescription,
  addComment,
  loadComments,
  updateComment,
  removeComment,
  resetTaskDetails
} from '../../redux/taskDetailsSlice';
import { setUsers, setLoading, setError } from '../../redux/usersSlice';
import { fetchUsers } from '../../api/usersApi';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Task, User, Comment } from '../../types/Types';
import './TaskDetail.css';
import TaskAttachments from '../../components/TaskAttachments/TaskAttachments';
import TaskHeader from './TaskHeader';
import TaskDescriptionBlock from './TaskDescriptionBlock';
import TaskCommentsBlock from './TaskCommentsBlock';
import TaskInfoBlock from './TaskInfoBlock';

type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { task, loading, error, comments } = useAppSelector(state => state.taskDetails);
  const { users } = useAppSelector(state => state.users);
  const currentUser = useAppSelector(state => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>('awaiting_action');
  const [localPriority, setLocalPriority] = useState('medium');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [isAwaitingMenuOpen, setIsAwaitingMenuOpen] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const awaitingMenuRef = useRef<HTMLDivElement>(null);
  const closeConfirmationRef = useRef<HTMLDivElement>(null);

  // --- Загрузка задачи и пользователей
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(loadTaskById(Number(id)));
      dispatch(loadComments(Number(id)));
    }
    return () => {
      dispatch(resetTaskDetails());
    };
  }, [dispatch, id, currentUser, navigate]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(setLoading(true));
      fetchUsers()
        .then(data => {
          dispatch(setUsers(data));
          dispatch(setLoading(false));
        })
        .catch(() => {
          dispatch(setError('Ошибка загрузки пользователей'));
          dispatch(setLoading(false));
        });
    }
  }, [dispatch, users.length]);

  // --- Обновляем локальные поля при загрузке задачи
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setLocalStatus(task.status as TaskStatus);
      setLocalPriority(task.priority);
    }
  }, [task]);

  // --- Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (awaitingMenuRef.current && !awaitingMenuRef.current.contains(event.target as Node)) {
        setIsAwaitingMenuOpen(false);
      }
      if (closeConfirmationRef.current && !closeConfirmationRef.current.contains(event.target as Node)) {
        setShowCloseConfirmation(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Управление статусом
  const handleStatusChange = (status: TaskStatus) => {
    if (task) {
      if (status === 'closed') {
        setShowCloseConfirmation(true);
      } else {
        dispatch(updateTaskStatus({ id: task.id, status }))
          .then(() => {
            setLocalStatus(status);
            dispatch(loadTaskById(task.id));
          });
        setIsAwaitingMenuOpen(false);
      }
    }
  };

  const confirmCloseTask = () => {
    if (task) {
      dispatch(updateTaskStatus({ id: task.id, status: 'closed' }))
        .then(() => {
          setLocalStatus('closed');
          dispatch(loadTaskById(task.id));
        });
      setShowCloseConfirmation(false);
    }
  };

  const cancelCloseTask = () => setShowCloseConfirmation(false);

  // --- Приоритет
  const handlePriorityChange = (priority: string) => {
    if (task) {
      setLocalPriority(priority);
      dispatch(updateTaskPriority({ id: task.id, priority }))
        .then(() => dispatch(loadTaskById(task.id)));
    }
  };

  // --- Ответственный
  const handleAssignResponsible = (userId: number) => {
    if (task) {
      dispatch(assignTaskResponsible({ id: task.id, responsible_id: userId }))
        .then(() => dispatch(loadTaskById(task.id)));
    }
  };
  const handleRemoveResponsible = () => {
    if (task) {
      dispatch(removeResponsible(task.id))
        .then(() => dispatch(loadTaskById(task.id)));
    }
  };

  // --- Комментарии
  const handleAddComment = async () => {
    if (newComment.trim() && task) {
      try {
        await dispatch(addComment({ taskId: task.id, text: newComment.trim() }));
        setNewComment('');
        dispatch(loadComments(task.id));
      } catch {
        dispatch(setError('Ошибка добавления комментария'));
      }
    }
  };
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };
  const handleSaveComment = async () => {
    if (editingCommentId && editedCommentText.trim()) {
      try {
        await dispatch(updateComment({ id: editingCommentId, text: editedCommentText }));
        setEditingCommentId(null);
        setEditedCommentText('');
        if (task) dispatch(loadComments(task.id));
      } catch {
        dispatch(setError('Ошибка обновления комментария'));
      }
    }
  };
  const handleDeleteComment = (commentId: number) => {
    if (task) {
      dispatch(removeComment(commentId))
        .then(() => dispatch(loadComments(task.id)))
        .catch(() => dispatch(setError('Ошибка удаления комментария')));
    }
  };

  // --- Сохранить название и описание
  const handleSaveTask = async () => {
    if (task && (editedTitle !== task.title || editedDescription !== task.description)) {
      try {
        if (editedTitle !== task.title) {
          await dispatch(updateTaskTitle({ id: task.id, title: editedTitle }));
        }
        if (editedDescription !== task.description) {
          await dispatch(updateTaskDescription({ id: task.id, description: editedDescription }));
        }
        dispatch(loadTaskById(task.id));
      } catch {
        dispatch(setError('Ошибка обновления задачи'));
      }
    }
    setIsEditing(false);
  };

  // --- Вспомогательные функции
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return 'task-detail__status-in-progress';
      case 'solved': return 'task-detail__status-solved';
      case 'closed': return 'task-detail__status-closed';
      case 'awaiting_response': return 'task-detail__status-awaiting-response';
      case 'awaiting_action': return 'task-detail__status-awaiting-action';
      default: return '';
    }
  };
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'task-detail__priority-low';
      case 'medium': return 'task-detail__priority-medium';
      case 'high': return 'task-detail__priority-high';
      case 'critical': return 'task-detail__priority-critical';
      default: return '';
    }
  };

  // --- UI ---
  if (loading && !task) return <LoadingScreen fullScreen />;
  if (error) return <div className="task-detail__error">{error}</div>;
  if (!task) return <div className="task-detail__not-found">Задача не найдена</div>;
  const isReadOnly = localStatus === 'closed';

  return (
    <div className="task-detail-container">
      <TaskHeader
        isReadOnly={isReadOnly}
        localStatus={localStatus}
        handleStatusChange={handleStatusChange}
        isAwaitingMenuOpen={isAwaitingMenuOpen}
        setIsAwaitingMenuOpen={setIsAwaitingMenuOpen}
        awaitingMenuRef={awaitingMenuRef}
        showCloseConfirmation={showCloseConfirmation}
        cancelCloseTask={cancelCloseTask}
        confirmCloseTask={confirmCloseTask}
        closeConfirmationRef={closeConfirmationRef}
        navigate={navigate}
      />
      <div className="task-detail__content">
        <div className="task-detail__left-column">
          <TaskDescriptionBlock
            task={task}
            isEditing={isEditing}
            editedTitle={editedTitle}
            editedDescription={editedDescription}
            setEditedTitle={setEditedTitle}
            setEditedDescription={setEditedDescription}
            setIsEditing={setIsEditing}
            handleSaveTask={handleSaveTask}
            isReadOnly={isReadOnly}
            currentUser={currentUser}
          />
          <TaskAttachments taskId={task.id} taskStatus={task.status} />
          <TaskCommentsBlock
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editedCommentText={editedCommentText}
            setEditedCommentText={setEditedCommentText}
            handleEditComment={handleEditComment}
            handleSaveComment={handleSaveComment}
            handleDeleteComment={handleDeleteComment}
            isReadOnly={isReadOnly}
            currentUser={currentUser}
          />
        </div>
        <div className="task-detail__right-column">
          <TaskInfoBlock
            task={task}
            localStatus={localStatus}
            formatDate={formatDate}
            getStatusClass={getStatusClass}
            localPriority={localPriority}
            handlePriorityChange={handlePriorityChange}
            getPriorityClass={getPriorityClass}
            users={users}
            handleAssignResponsible={handleAssignResponsible}
            handleRemoveResponsible={handleRemoveResponsible}
            currentUser={currentUser}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};
export default TaskDetail;