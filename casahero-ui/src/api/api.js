import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL ?? '/casahero-api';

const api = axios.create({
  baseURL: BASE_URL, // your backend URL
  timeout: 10000, // optional: request timeout
  headers: { 'Content-Type': 'application/json' },
});

export default api;
