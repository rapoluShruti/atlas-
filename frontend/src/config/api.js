import axios from 'axios';

const getApiHost = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  return window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.host}`;
};

export const API_BASE_URL = `${getApiHost()}/api`;

// Create Axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API_ROUTES = {
  health: `${API_BASE_URL}/health`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/me`,
  createPlan: `${API_BASE_URL}/create-plan`,
  getPlan: `${API_BASE_URL}/get-plan`,
};

