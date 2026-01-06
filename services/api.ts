import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
});

API.interceptors.request.use((config) => {
    const user = localStorage.getItem('medsmart_user');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const api = {
    // Auth
    login: (data: any) => API.post('/auth/login', data),
    register: (data: any) => API.post('/auth/register', data),

    // User
    getUserProfile: (id: string) => API.get(`/users/profile/${id}`),
    updateProfile: (id: string, data: any) => API.put(`/users/profile/${id}`, data),
    markAppOpened: (id: string) => API.put(`/users/profile/${id}/open`),

    // Medicines
    getMedicineStore: () => API.get('/medicines/store'),
    getUserMedicines: () => API.get('/medicines/my-medicines'),
    addMedicineToUser: (data: any) => API.post('/medicines/add-to-user', data),
    uploadMedicine: (data: FormData) => API.post('/medicines', data),
    deleteMedicine: (id: string) => API.delete(`/medicines/${id}`),

    // Adherence
    logAdherence: (data: any) => API.post('/adherence/log', data),
    getUserLogs: () => API.get('/adherence/user-logs'),

    // Messages
    sendMessage: (data: any) => API.post('/messages/send', data),
    getReceivedMessages: () => API.get('/messages/received'),
    getThread: (userId: string) => API.get(`/messages/thread/${userId}`),
    markMessagesRead: (userId: string) => API.post(`/messages/mark-read/${userId}`),

    // Admin
    getAllUsers: () => API.get('/users'),
    assignDoctor: (userId: string, data: any) => API.put(`/users/assign-doctor/${userId}`, data),
    adminGetAllMedicines: () => API.get('/admin/medicines'),

    // Orders
    createOrder: (data: any) => API.post('/orders', data),
    getMyOrders: () => API.get('/orders/my'),
    adminGetOrders: () => API.get('/orders'),
    adminAcceptOrder: (id: string) => API.put(`/orders/${id}/accept`),

    // Notifications
    getMyNotifications: () => API.get('/notifications'),
    markNotificationRead: (id: string) => API.put(`/notifications/${id}/read`),

    // Reminders
    createReminder: (data: any) => API.post('/reminders', data),
    getMyReminders: () => API.get('/reminders/my'),
    updateReminder: (id: string, data: any) => API.put(`/reminders/${id}`, data),
    cancelReminder: (id: string) => API.delete(`/reminders/${id}`)
};

export default API;
