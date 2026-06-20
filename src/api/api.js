import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
API.interceptors.response.use(
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

// Auth endpoints
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getCurrentUser = () => API.get('/auth/me');

// Profile endpoints
export const getProfile = () => API.get('/profile');
export const updateProfile = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return API.put('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Recipe endpoints
export const getRecipes = (params) => API.get('/recipes', { params });
export const getRecipe = (id) => API.get(`/recipes/${id}`);
export const createRecipe = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === 'ingredients' || key === 'steps') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === 'dietaryPreference') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return API.post('/recipes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const updateRecipe = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === 'ingredients' || key === 'steps') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === 'dietaryPreference') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return API.put(`/recipes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteRecipe = (id) => API.delete(`/recipes/${id}`);
export const toggleLike = (id) => API.post(`/recipes/${id}/like`);
export const rateRecipe = (id, value) => API.post(`/recipes/${id}/rate`, { value });
export const addComment = (id, text) => API.post(`/recipes/${id}/comment`, { text });

// Favorite endpoints
export const getFavorites = () => API.get('/favorites');
export const toggleFavorite = (id) => API.post(`/favorites/${id}`);
export const checkFavorite = (id) => API.get(`/favorites/check/${id}`);

// Meal Plan endpoints
export const getMealPlans = () => API.get('/mealplans');
export const createMealPlan = (data) => API.post('/mealplans', data);
export const deleteMealPlan = (id) => API.delete(`/mealplans/${id}`);
export const getShoppingList = () => API.get('/mealplans/shopping-list');

export default API;