import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://api.saltandsun.life'
    : process.env.API_URL || 'https://api.saltandsun.life',
  withCredentials: true,
});

// Type definition for global cookies
declare global {
  let cookies: Record<string, string> | undefined;
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const csrfToken = localStorage.getItem('_csrfToken');
      if (csrfToken) {
        config.headers = config.headers || new AxiosHeaders();
        config.headers.set('x-csrf-token', csrfToken);
      }
    }

    // Handle headers conditionally
    if (config.headers && Object.keys(config.headers).length === 0) {
      config.headers = new AxiosHeaders();
    }

    return config;
  },
  (error: Error) => Promise.reject(new Error(error.message))
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 401 or 403 error, return the error response
    // instead of throwing it, so components can handle it
    if (error.response?.status === 401 || error.response?.status === 403) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
