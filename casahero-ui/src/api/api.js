import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/casahero-api', // your backend URL
  timeout: 10000, // optional: request timeout
  headers: { 'Content-Type': 'application/json' },
});

export default api;
