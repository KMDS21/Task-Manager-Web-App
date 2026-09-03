import API from './axios';

export const fetchTasks = (params) => API.get('/tasks', { params });
export const fetchTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const acceptTask = (id) => API.post(`/tasks/${id}/accept`);
export const rejectTask = (id, reason) => API.post(`/tasks/${id}/reject`, { reason });
export const completeTask = (id) => API.post(`/tasks/${id}/complete`);

export const uploadTaskFile = (id, formData) =>
  API.post(`/tasks/${id}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTaskFile = (id, fileId) =>
  API.delete(`/tasks/${id}/files/${fileId}`);
