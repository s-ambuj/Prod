import axios from 'axios';

const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
  getCurrentUser: () => api.get('/auth/me'),
};

export const patientAPI = {
  bookAppointment: (data) => api.post('/patients/appointments', data),
  getMyAppointments: () => api.get('/patients/appointments/my'),
  getAppointmentDetail: (id) => api.get(`/patients/appointments/${id}`),
  getMyPrescriptions: () => api.get('/patients/prescriptions/my'),
  getPrescriptionDetail: (id) => api.get(`/patients/prescriptions/${id}`),
};

export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getProfile: () => api.get('/doctors/profile'),
  updateAvailability: (availability) => api.put('/doctors/availability', { availability }),
  getMyAppointments: () => api.get('/doctors/appointments/my'),
  updateAppointmentStatus: (id, status) => api.put(`/doctors/appointments/${id}/status`, null, { params: { status } }),
  createPrescription: (data) => api.post('/doctors/prescriptions', data),
  getMyPrescriptions: () => api.get('/doctors/prescriptions/my'),
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/${role}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveDoctor: (id) => api.put(`/admin/doctors/${id}/approve`),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  getReports: () => api.get('/admin/reports'),
};

export default api;
