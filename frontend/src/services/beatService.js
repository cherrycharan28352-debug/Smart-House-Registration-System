import api from './api';

export const getBeats = async () => {
  const response = await api.get('/beats');
  return response.data.data;
};

export const getBeatByNumber = async (beatNumber) => {
  const response = await api.get(`/beats/${encodeURIComponent(beatNumber)}`);
  return response.data.data;
};

export const updateBeat = async (beatNumber, beatData) => {
  const response = await api.put(`/beats/${encodeURIComponent(beatNumber)}`, beatData);
  return response.data;
};

export const addVillageToBeat = async (beatNumber, villageData) => {
  const response = await api.post(`/beats/${encodeURIComponent(beatNumber)}/villages`, villageData);
  return response.data;
};

export const updateVillage = async (villageId, villageData) => {
  const response = await api.put(`/villages/${encodeURIComponent(villageId)}`, villageData);
  return response.data;
};

export const deleteVillage = async (villageId) => {
  const response = await api.delete(`/villages/${encodeURIComponent(villageId)}`);
  return response.data;
};

export const getVillageDetails = async (villageId) => {
  const response = await api.get(`/villages/${encodeURIComponent(villageId)}`);
  return response.data.data;
};
