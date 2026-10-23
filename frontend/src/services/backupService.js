import api from './api';

export const getBackupOverview = async () => {
  const response = await api.get('/backup/overview');
  return response.data.data;
};

export const listBackups = async (params = {}) => {
  const response = await api.get('/backup/list', { params });
  return response.data;
};

export const createManualBackup = async (data = {}) => {
  const response = await api.post('/backup/create', data);
  return response.data;
};

export const verifyBackupIntegrity = async (backupId) => {
  const response = await api.post(`/backup/${backupId}/verify`);
  return response.data;
};

export const restoreFromBackup = async (backupId, confirmationData) => {
  const response = await api.post(`/backup/${backupId}/restore`, confirmationData);
  return response.data;
};

export const downloadBackupArchive = async (backupId, filename) => {
  const response = await api.get(`/backup/${backupId}/download`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/zip' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename || `backup_${backupId}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const deleteBackup = async (backupId) => {
  const response = await api.delete(`/backup/${backupId}`);
  return response.data;
};

export const getRestoreHistory = async () => {
  const response = await api.get('/backup/restore-history');
  return response.data.data;
};

export const updateBackupSettings = async (settings) => {
  const response = await api.put('/backup/settings', settings);
  return response.data;
};
