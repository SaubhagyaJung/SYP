import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jkb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = (d) => API.post('/auth/login', d);
export const registerUser = (d) => API.post('/auth/register', d);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (d) => API.put('/auth/profile', d);
export const getProperties = (p) => API.get('/properties', { params: p });
export const getFeaturedProperties = () => API.get('/properties/featured');
export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const createProperty = (d) => API.post('/properties', d);
export const updateProperty = (id, d) => API.put(`/properties/${id}`, d);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
export const getUserProperties = () => API.get('/properties/mine');
export const createInquiry = (d) => API.post('/inquiries', d);
export const getMyInquiries = () => API.get('/inquiries/mine');
export const updateInquiryStatus = (id, s) => API.put(`/inquiries/${id}/status`, { status: s });
export const getFavorites = () => API.get('/favorites');
export const toggleFavorite = (id) => API.post(`/favorites/${id}`);
export const checkFavorite = (id) => API.get(`/favorites/${id}/check`);
export const uploadImages = (fd) => API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadAvatar = async (file) => {
  const fd = new FormData();
  fd.append('images', file);
  const res = await API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.urls[0];
};
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const updateUserRole = (id, r) => API.put(`/admin/users/${id}/role`, { role: r });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminProperties = () => API.get('/admin/properties');
export const updatePropertyStatus = (id, s) => API.put(`/admin/properties/${id}/status`, { status: s });
export const toggleFeaturedProperty = (id) => API.put(`/admin/properties/${id}/featured`);
export const getAdminInquiries = () => API.get('/admin/inquiries');
export const adminDeleteProperty = (id) => API.delete(`/admin/properties/${id}`);
export const updateAdminInquiryStatus = (id, status) => API.put(`/admin/inquiries/${id}/status`, { status });

export const getMyNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const replyToInquiry = (id, replyMessage) => API.post(`/inquiries/${id}/reply`, { replyMessage });

// Reviews
export const getPublicReviews = () => API.get('/reviews');
export const submitReview = (d) => API.post('/reviews', d);
export const getAdminReviews = () => API.get('/admin/reviews');
export const createAdminReview = (d) => API.post('/admin/reviews', d);
export const updateAdminReview = (id, d) => API.put(`/admin/reviews/${id}`, d);
export const deleteAdminReview = (id) => API.delete(`/admin/reviews/${id}`);
export const toggleAdminReviewActive = (id) => API.put(`/admin/reviews/${id}/toggle`);

export default API;
