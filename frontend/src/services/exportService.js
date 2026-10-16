import api from './api';

// Helper function to trigger browser file download from Blob
const triggerFileDownload = (blobData, filename) => {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadSingleHousePDF = async (id, houseId = 'Record') => {
  const response = await api.get(`/houses/${id}/export/pdf`, {
    responseType: 'blob'
  });
  triggerFileDownload(response.data, `House_Registration_${houseId}.pdf`);
};

export const downloadSingleHouseExcel = async (id, houseId = 'Record') => {
  const response = await api.get(`/houses/${id}/export/excel`, {
    responseType: 'blob'
  });
  triggerFileDownload(response.data, `House_Registration_${houseId}.xlsx`);
};

export const downloadBulkHousesPDF = async (houseIds = []) => {
  const response = await api.post(
    '/houses/export/bulk/pdf',
    { houseIds },
    { responseType: 'blob' }
  );
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(response.data, `House_Registrations_Bulk_${dateStr}.pdf`);
};

export const downloadBulkHousesExcel = async (houseIds = []) => {
  const response = await api.post(
    '/houses/export/bulk/excel',
    { houseIds },
    { responseType: 'blob' }
  );
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(response.data, `House_Registrations_Bulk_${dateStr}.xlsx`);
};
