import axios from 'axios'

const BASE = 'http://localhost:8080/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (username) => api.post(`/auth/send-otp?username=${username}`),
  verifyOtp: (username, otp) => api.post(`/auth/verify-otp?username=${username}&otp=${otp}`),
  sendResetOtp: (username) => api.post(`/auth/send-reset-otp?username=${username}`),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ADMIN
export const adminAPI = {
  reports: () => api.get('/admin/reports'),
  heatmap: () => api.get('/admin/heatmap'),
  ngoRequests: () => api.get('/admin/ngo-requests'),
  donations: () => api.get('/admin/donations'),
}

// DONOR
export const donorAPI = {
  heatmap: () => api.get('/donor/heatmap'),
  requests: () => api.get('/donor/requests'),
  donate: (ngoRequestId, donorId, data) =>
    api.post(`/donor/donate/${ngoRequestId}?donorId=${donorId}`, data),
  myDonations: (donorId) => api.get(`/donor/my-donations?donorId=${donorId}`),
}

// NGO
export const ngoAPI = {
  heatmap: () => api.get('/ngo/heatmap'),
  createRequest: (ngoId, data) => api.post(`/ngo/request?ngoId=${ngoId}`, data),
  availableDonations: (ngoId) => api.get(`/ngo/available-donations?ngoId=${ngoId}`),
  myRequests: (ngoId) => api.get(`/ngo/my-requests?ngoId=${ngoId}`),
  acceptDonation: (id, ngoId) => api.post(`/ngo/accept/${id}?ngoId=${ngoId}`),
  deliverDonation: (id, ngoId) => api.post(`/ngo/delivered/${id}?ngoId=${ngoId}`),
}

// VICTIM
export const victimAPI = {
  heatmap: () => api.get('/victim/heatmap'),
  createReport: (victimId, data) => api.post(`/victim/create?victimId=${victimId}`, data),
  myReports: (victimId) => api.get(`/victim/my-reports?victimId=${victimId}`),
}

export default api
