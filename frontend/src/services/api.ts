import axios from 'axios';
import type { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const errorResponse: ApiResponse<never> = err.response?.data || {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err.message },
    };
    return Promise.reject(errorResponse);
  }
);

export default api;
