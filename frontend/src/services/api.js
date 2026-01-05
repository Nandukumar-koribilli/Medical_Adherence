import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// User APIs
export const getProfile = (id) => API.get(`/users/profile/${id}`);
export const updateProfile = (id, data) => API.put(`/users/profile/${id}`, data);
export const getDoctors = () => API.get('/users/doctors');
export const getAllUsers = () => API.get('/users');

// Medicine APIs
export const getMedicineStore = () => API.get('/medicines/store');
export const addMedicineToUser = (data) => API.post('/medicines/add-to-user', data);
export const getUserMedicines = () => API.get('/medicines/my-medicines');
export const uploadMedicine = (data) => API.post('/medicines/upload', data);
export const deleteMedicine = (id) => API.delete(`/medicines/${id}`);

// Adherence APIs
export const logAdherence = (data) => API.post('/adherence/log', data);
export const getUserLogs = () => API.get('/adherence/user-logs');
export const getAdherenceStats = (userId) => API.get(`/adherence/stats/${userId}`);

// Message APIs
export const sendMessage = (data) => API.post('/messages/send', data);
export const getReceivedMessages = () => API.get('/messages/received');
export const getSentMessages = () => API.get('/messages/sent');
export const markMessageAsRead = (id) => API.put(`/messages/${id}/read`);

// Admin APIs
export const assignPatient = (data) => API.post('/admin/assign-patient', data);
export const getAllMedicines = () => API.get('/admin/medicines');
export const updateMedicineStock = (id, data) => API.put(`/admin/medicines/${id}`, data);

export default API;
