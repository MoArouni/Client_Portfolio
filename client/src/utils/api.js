import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token to requests when available
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

// Auth API
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData),
  login: (formData) => api.post('/auth/login', formData),
  getUser: () => api.get('/auth'),
  getGoogleAuthUrl: () => api.get('/auth/google'),
  getGoogleEvents: () => api.get('/auth/google/events')
};

// Appointment API
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getUserAppointments: () => api.get('/appointments/me'),
  getAvailability: (startDate, endDate) => 
    api.get(`/appointments/availability?startDate=${startDate}&endDate=${endDate}`),
  book: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status })
};

// Blog API
export const blogAPI = {
  getAll: () => api.get('/blog'),
  getById: (id) => api.get(`/blog/${id}`),
  create: (blogData) => api.post('/blog', blogData),
  update: (id, blogData) => api.put(`/blog/${id}`, blogData),
  delete: (id) => api.delete(`/blog/${id}`)
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`)
};

export default api; 