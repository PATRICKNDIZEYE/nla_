import axios from "axios";
import Keys from "../constants/keys";
import Secure from "../helpers/secureLS";
import { deleteCookie } from "cookies-next";

// Determine base URL based on environment
const getBaseUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser (client-side), use relative URL
  if (typeof window !== 'undefined') {
    return '/api';
  }
  
  // In server-side, use the full URL
  return process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api` : 'http://localhost:3000/api';
};

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: getBaseUrl(),
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = Secure.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      deleteCookie("token");
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
