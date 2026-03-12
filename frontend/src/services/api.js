import axios from 'axios';

// Create an Axios instance
// This can be easily configured to point to a Spring Boot backend in the future.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for responses to handle errors globally if needed
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data portion
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
