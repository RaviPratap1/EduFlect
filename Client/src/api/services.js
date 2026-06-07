import api from './axiosInstance';

// ── AUTH ──────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const changePassword = (data) => api.put('/auth/change-password', data);

// ── PROFILE ───────────────────────────────────────────────────
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadAvatar = (formData) => api.patch('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Admin
export const adminGetAllUsers = (params) => api.get('/profile/admin/users', { params });
export const adminDeleteUser = (userId) => api.delete(`/profile/admin/users/${userId}`);
export const adminUpdateUserRole = (userId, role) => api.patch(`/profile/admin/users/${userId}/role`, { role });

// ── CATEGORIES ────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');
export const getCategoryWithCourses = (id) => api.get(`/categories/${id}/courses`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ── COURSES ───────────────────────────────────────────────────
export const getCourses = (params) => api.get('/courses', { params });
export const getCourse = (id) => api.get(`/courses/${id}`);
export const getInstructorCourses = () => api.get('/courses/instructor/my-courses');
export const adminGetAllCourses = () => api.get('/courses/admin/all');
export const createCourse = (formData) => api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCourse = (id, formData) => api.put(`/courses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const togglePublish = (id) => api.patch(`/courses/${id}/toggle-publish`);

// ── SECTIONS ──────────────────────────────────────────────────
export const createSection = (data) => api.post('/sections', data);
export const updateSection = (id, data) => api.put(`/sections/${id}`, data);
export const deleteSection = (id) => api.delete(`/sections/${id}`);

// ── SUBSECTIONS ───────────────────────────────────────────────
export const createSubSection = (data) => api.post('/subsections', data);
export const updateSubSection = (id, data) => api.put(`/subsections/${id}`, data);
export const deleteSubSection = (id) => api.delete(`/subsections/${id}`);

// ── RATINGS ───────────────────────────────────────────────────
export const getTopReviews = () => api.get('/ratings/top');
export const getCourseReviews = (courseId) => api.get(`/ratings/course/${courseId}`);
export const createRating = (data) => api.post('/ratings', data);
export const deleteReview = (id) => api.delete(`/ratings/${id}`);
export const getMyReviews = () =>  api.get('/ratings/my-reviews');


// ── PAYMENTS (RAZORPAY) ───────────────────────────────────────
export const createOrder = (courseId) => api.post('/payments/create-order', { courseId });
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPaymentHistory = () => api.get('/payments/history');
export const adminGetAllPayments = (params) => api.get('/payments/admin/all', { params });

// ── ENROLLMENT / PROGRESS ─────────────────────────────────────
export const getMyEnrollments = () => api.get('/enrollments/my-courses');
export const getCourseProgress = (courseId) => api.get(`/enrollments/progress/${courseId}`);
export const markComplete = (data) => api.post('/enrollments/progress/complete', data);
export const markIncomplete = (data) => api.post('/enrollments/progress/incomplete', data);
