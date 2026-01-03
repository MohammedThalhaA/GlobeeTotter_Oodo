import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
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

// Response interceptor - handle auth errors
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

// Auth API
export const authAPI = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getProfile: () => api.get('/auth/profile'),

    updateProfile: (data: { name?: string; profile_photo?: string }) =>
        api.put('/auth/profile', data),
};

// Trips API
export const tripsAPI = {
    getAll: () => api.get('/trips'),

    getRecent: () => api.get('/trips/recent'),

    getStats: () => api.get('/trips/stats'),

    getById: (id: number) => api.get(`/trips/${id}`),

    create: (data: {
        title: string;
        description?: string;
        start_date: string;
        end_date: string;
        cover_photo?: string;
        is_public?: boolean;
    }) => api.post('/trips', data),

    update: (id: number, data: Partial<{
        title: string;
        description: string;
        start_date: string;
        end_date: string;
        cover_photo: string;
        is_public: boolean;
    }>) => api.put(`/trips/${id}`, data),

    delete: (id: number) => api.delete(`/trips/${id}`),
};

// Cities API
export const citiesAPI = {
    getAll: (params?: { search?: string; country?: string; sort?: string }) =>
        api.get('/cities', { params }),

    getPopular: () => api.get('/cities/popular'),

    getById: (id: number) => api.get(`/cities/${id}`),

    getCountries: () => api.get('/cities/meta/countries'),
};

// Stops API
export const stopsAPI = {
    getAll: (tripId: number) => api.get(`/trips/${tripId}/stops`),

    add: (tripId: number, data: {
        city_id?: number;
        city_name: string;
        start_date: string;
        end_date: string;
        notes?: string;
    }) => api.post(`/trips/${tripId}/stops`, data),

    update: (tripId: number, stopId: number, data: {
        city_name?: string;
        start_date?: string;
        end_date?: string;
        notes?: string;
    }) => api.put(`/trips/${tripId}/stops/${stopId}`, data),

    delete: (tripId: number, stopId: number) =>
        api.delete(`/trips/${tripId}/stops/${stopId}`),

    reorder: (tripId: number, stopIds: number[]) =>
        api.put(`/trips/${tripId}/stops/reorder`, { stopIds }),
};

// Activities API
export const activitiesAPI = {
    search: (params?: {
        city_id?: number;
        category?: string;
        search?: string;
        min_cost?: number;
        max_cost?: number;
    }) => api.get('/activities', { params }),

    getCategories: () => api.get('/activities/categories'),

    addToStop: (stopId: number, data: {
        activity_id?: number;
        activity_name: string;
        scheduled_date?: string;
        scheduled_time?: string;
        custom_cost?: number;
        notes?: string;
    }) => api.post(`/activities/stops/${stopId}`, data),

    update: (id: number, data: {
        activity_name?: string;
        scheduled_date?: string;
        scheduled_time?: string;
        custom_cost?: number;
        notes?: string;
        status?: string;
    }) => api.put(`/activities/trip-activities/${id}`, data),

    remove: (id: number) => api.delete(`/activities/trip-activities/${id}`),
};

// Budget API
export const budgetAPI = {
    getTripBudget: (tripId: number) => api.get(`/budget/trips/${tripId}`),
};

export default api;
