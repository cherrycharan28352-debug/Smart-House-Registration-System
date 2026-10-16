import api from './api';

export const getHouses = async (params = {}) => {
  const response = await api.get('/houses', { params });
  return response.data;
};

export const getHouseById = async (id) => {
  const response = await api.get(`/houses/${id}`);
  return response.data.data;
};

export const createHouse = async (houseData) => {
  const response = await api.post('/houses', houseData);
  return response.data;
};

export const updateHouse = async (id, houseData) => {
  const response = await api.put(`/houses/${id}`, houseData);
  return response.data;
};

export const deleteHouse = async (id) => {
  const response = await api.delete(`/houses/${id}`);
  return response.data;
};

export const getLocalitiesMeta = async () => {
  const response = await api.get('/houses/meta/localities');
  return response.data.data;
};

// Photo management
export const uploadHousePhotos = async (houseId, formData) => {
  const response = await api.post(`/photos/houses/${houseId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getHousePhotos = async (houseId) => {
  const response = await api.get(`/photos/houses/${houseId}/photos`);
  return response.data.data;
};

export const deleteHousePhoto = async (houseId, photoId) => {
  const response = await api.delete(`/photos/houses/${houseId}/photos/${photoId}`);
  return response.data;
};

export const getAllPhotos = async (params = {}) => {
  const response = await api.get('/photos', { params });
  return response.data;
};

// Owner management
export const getAllOwners = async (params = {}) => {
  const response = await api.get('/owners', { params });
  return response.data;
};

export const updateHouseOwner = async (houseId, ownerData) => {
  const response = await api.put(`/owners/${houseId}/owner`, ownerData);
  return response.data;
};

// Family member management
export const getAllFamilyMembers = async (params = {}) => {
  const response = await api.get('/family/all', { params });
  return response.data;
};

export const addHouseFamilyMember = async (houseId, memberData) => {
  const response = await api.post(`/family/${houseId}/family`, memberData);
  return response.data;
};

export const updateFamilyMember = async (memberId, memberData) => {
  const response = await api.put(`/family/${memberId}`, memberData);
  return response.data;
};

export const deleteFamilyMember = async (memberId) => {
  const response = await api.delete(`/family/${memberId}`);
  return response.data;
};

// Security & Issues Survey management
export const addHouseIssue = async (houseId, issueData) => {
  const response = await api.post(`/houses/${houseId}/issues`, issueData);
  return response.data;
};

export const updateIssueAction = async (houseId, issueId, actionData) => {
  const response = await api.put(`/houses/${houseId}/issues/${issueId}/action`, actionData);
  return response.data;
};

export const updateHouseSecurity = async (houseId, securityData) => {
  const response = await api.put(`/houses/${houseId}/security`, securityData);
  return response.data;
};

export const getIssuesLedger = async (params = {}) => {
  const response = await api.get('/houses/issues/ledger', { params });
  return response.data;
};

