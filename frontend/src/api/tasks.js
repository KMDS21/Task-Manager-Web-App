import API from './axios';

export const fetchTasks = async (params = {}) => {
  const response = await API.get('/tasks', { params });
  return response.data;
};

export const fetchTaskById = async (id) => {
  const response = await API.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await API.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

export const uploadTaskFile = async (taskId, formData) => {
  const response = await API.post(`/tasks/${taskId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTaskFile = async (taskId, fileId) => {
  const response = await API.delete(`/tasks/${taskId}/files/${fileId}`);
  return response.data;
};

