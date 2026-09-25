import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Automatically inject JWT token into authorization header if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('routecraft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for friendly error formatting
API.interceptors.response.use(
  (response) => response,
  (error) => {
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
export const calculateRouteApi = (points) => API.post('/route/calculate', { points });
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
