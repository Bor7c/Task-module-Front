import { Task, Comment } from '../../types/Task';
import { User } from '../../types/User';

export type TaskDetailProps = {
  task: Task;
  user: User | null;
  onStatusChange: (status: string) => void;
  onTitleSave: (title: string) => void;
  onDescriptionSave: (description: string) => void;
  onPriorityChange: (priority: string) => void;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: number) => void;
  onEditComment: (commentId: number, text: string) => void;
  onTakeTask: () => void;
  onReleaseTask: () => void;
  onMarkSolved: () => void;
  onMarkClosed: () => void;
  onResponsibleChange: (responsibleId: number | null) => void;
};

export type StatusDisplayConfig = {
  [key: string]: {
    text: string;
    color: string;
  };
};