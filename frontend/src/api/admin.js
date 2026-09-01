import API from './axios';

export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchAdminUsers = (search) => API.get('/admin/users', { params: { search } });
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
