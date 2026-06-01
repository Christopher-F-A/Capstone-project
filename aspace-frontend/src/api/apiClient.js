import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Punta a Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// INIETTA IL TOKEN AUTOMATICAMENTE
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

export default apiClient;