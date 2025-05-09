import api from './axiosConfig';

export const fetchTeams = () => api.get('/teams/');
export const fetchTeamDetail = (id: number) => api.get(`/teams/${id}/`);
export const createTeam = (data: { name: string }) => api.post('/teams/', data);
export const updateTeam = (id: number, data: { name: string }) => api.put(`/teams/${id}/`, data);
export const deleteTeam = (id: number) => api.delete(`/teams/${id}/`);
export const addTeamMember = (id: number, userId: number) => api.post(`/teams/${id}/add-member/`, { user_id: userId });
export const removeTeamMember = (id: number, userId: number) => api.post(`/teams/${id}/remove-member/`, { user_id: userId });
