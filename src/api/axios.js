import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', //   directamente al puerto del backend
  withCredentials: true               //   para que las cookies de sesión (JWT) 
});

export default api;