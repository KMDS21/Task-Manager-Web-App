import API from './axios';

export const fetchTasks = (params) => API.get('/tasks', { params });
export const fetchTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const uploadTaskFile = (id, formData) =>
  API.post(`/tasks/${id}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTaskFile = (id, fileId) =>
  API.delete(`/tasks/${id}/files/${fileId}`);
