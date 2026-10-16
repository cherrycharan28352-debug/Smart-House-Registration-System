import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerStaffUser = async (staffData) => {
  const response = await api.post('/auth/register-staff', staffData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('shms_token');
    localStorage.removeItem('shms_user');
  }
};

export const changeUserPassword = async (passwords) => {
  const response = await api.put('/auth/change-password', passwords);
  return response.data;
};
