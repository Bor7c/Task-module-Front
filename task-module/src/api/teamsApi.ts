import api from './axiosConfig';
import { Team } from '../types/Types'; // Предполагается, что тип Team у тебя есть

// Получение списка команд
export const fetchTeams = async (): Promise<Team[]> => {
  const response = await api.get('/teams/');
  return response.data;
};

// Получение списка всех команд в сокращённом формате
export const fetchAllTeams = async (): Promise<Team[]> => {
  const response = await api.get('/teams/all/');
  return response.data;
};

// Получение подробной информации о команде
export const fetchTeamDetail = async (id: number): Promise<Team> => {
  const response = await api.get(`/teams/${id}/`);
  return response.data;
};

// Создание новой команды
export const createTeam = async (data: { name: string; description?: string; members_ids?: number[] }): Promise<Team> => {
  const response = await api.post('/teams/', data);
  return response.data;
};

// Обновление информации о команде
export const updateTeam = async (id: number, data: { name: string; description?: string }): Promise<Team> => {
  const response = await api.patch(`/teams/${id}/`, data);
  return response.data;
};

// Удаление команды
export const deleteTeam = async (id: number): Promise<void> => {
  await api.delete(`/teams/${id}/`);
};

// Добавление участника в команду
export const addTeamMember = async (id: number, userId: number): Promise<Team> => {
  const response = await api.post(`/teams/${id}/add-member/`, { user_id: userId });
  return response.data;
};

// Удаление участника из команды
export const removeTeamMember = async (id: number, userId: number): Promise<Team> => {
  const response = await api.post(`/teams/${id}/remove-member/`, { user_id: userId });
  return response.data;
};
