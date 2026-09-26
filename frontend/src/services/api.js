import axios from 'axios';

/**
 * Resolves the appropriate API base URL dynamically:
 * 1. Checks VITE_API_URL or VITE_BACKEND_URL environment variable if set.
 * 2. If running on Vercel deployment (*.vercel.app), targets the live Render backend.
 * 3. Falls back to relative '/api' for localhost Vite proxy.
 */
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    const url = import.meta.env.VITE_BACKEND_URL.trim().replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }

  // Automatic detection for production Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://routecraft-jdi6.onrender.com/api';
  }

  return '/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically inject JWT token into authorization header if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('routecraft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for friendly error formatting and auth handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid (HTTP 401 on protected route), clear invalid token
    if (error.response?.status === 401 && error.config?.url !== '/auth/login' && error.config?.url !== '/auth/register') {
      const storedToken = localStorage.getItem('routecraft_token');
      if (storedToken) {
        console.warn('[API Interceptor] Auth session expired. Clearing local session.');
        localStorage.removeItem('routecraft_token');
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const getMeApi = () => API.get('/auth/me');
export const updateProfileApi = (data) => API.put('/auth/profile', data);

// Route & Pitstop Services
export const geocodeApi = (query) => API.post('/route/geocode', { query });
export const searchSuggestionsApi = (query) => API.get('/route/autocomplete', { params: { query } });
export const reverseGeocodeApi = (latitude, longitude) => API.post('/route/reverse', { latitude, longitude });
export const calculateRouteApi = (points, vehicleType = 'car', travelersCount = 1) =>
  API.post('/route/calculate', { points, vehicleType, travelersCount });
export const discoverPitstopsApi = (data) => API.post('/route/pitstops', data);
export const calculateDetourApi = (data) => API.post('/route/detour', data);

// Trip Services
export const createTripApi = (tripData) => API.post('/trips', tripData);
export const getTripsApi = () => API.get('/trips');
export const getTripByIdApi = (id) => API.get(`/trips/${id}`);
export const updateTripApi = (id, tripData) => API.put(`/trips/${id}`, tripData);
export const deleteTripApi = (id) => API.delete(`/trips/${id}`);

// Places & Reviews
export const getPlacesApi = (params) => API.get('/places', { params });
export const getPlaceByIdApi = (id) => API.get(`/places/${id}`);
export const createReviewApi = (reviewData) => API.post('/reviews', reviewData);
export const getReviewsByPlaceApi = (placeId) => API.get(`/reviews/${placeId}`);

export default API;
