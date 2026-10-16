import api from './api';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const approveStaff = async (id, payload) => {
  const response = await api.put(`/users/${id}/approve`, payload);
  return response.data;
};

export const rejectStaff = async (id, payload) => {
  const response = await api.put(`/users/${id}/reject`, payload);
  return response.data;
};

export const updateStaffStatus = async (id, payload) => {
  const response = await api.put(`/users/${id}/status`, payload);
  return response.data;
};

export const assignStaffJurisdiction = async (id, payload) => {
  const response = await api.put(`/users/${id}/assign`, payload);
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/users/audit-logs', { params });
  return response.data;
};
