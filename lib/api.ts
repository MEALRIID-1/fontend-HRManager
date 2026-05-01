import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Simple toast implementation - replace with react-hot-toast if installed
const toast = {
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      // Log error and avoid blocking alert to prevent modal loops in dev
      console.error(message);
    }
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first, then from cookies
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/login');
      
      switch (status) {
        case 401:
          // Ignore failed login attempts here so the page can show its own message.
          if (isLoginRequest) {
            break;
          }

          // Clear token and redirect to login for expired/invalid sessions.
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }
          break;
        
        case 403:
          // Show access denied toast
          toast.error('Accès refusé');
          break;
        
        case 500:
          // Show server error toast
          toast.error('Erreur serveur, réessayez');
          break;
        
        default:
          // Format other errors consistently
          const message = error.response.data as any;
          const errorMessage = message?.message || message?.error || 'Une erreur est survenue';
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      toast.error('Erreur de connexion, vérifiez votre internet');
    } else {
      // Other errors
      toast.error('Une erreur est survenue');
    }
    
    return Promise.reject(error);
  }
);

export default api;
