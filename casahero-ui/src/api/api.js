import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL ?? '/casahero-api';

const api = axios.create({
  baseURL: BASE_URL, // your backend URL
  timeout: 10000, // optional: request timeout
  headers: { 'Content-Type': 'application/json' },
});

// Anything that isn't JSON (e.g. index.html from the dev server or the SPA fallback when the
// MSW worker stops intercepting) is an error, so React Query keeps the last good data.
api.interceptors.response.use((response) => {
  const contentType = response.headers['content-type'] ?? '';
  if (response.status !== 204 && !contentType.includes('application/json')) {
    const error = new Error(
      `Expected JSON from ${response.config.url}, got "${contentType || 'no content type'}"`,
    );
    error.config = response.config;
    error.notJson = true;
    return Promise.reject(error);
  }
  return response;
});

export default api;
