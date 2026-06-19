/**
 * Axios API Client
 * 
 * Centralized HTTP client with:
 * - Request/response interceptors
 * - Automatic JWT attachment
 * - Error handling
 * - Token refresh
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getIdToken, refreshSession, isTokenExpired } from '@/lib/cognito';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api.types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get ID token from Cognito
      const token = await getIdToken();
      
      // Check if token is expired and refresh if needed
      if (isTokenExpired(token)) {
        await refreshSession();
        const newToken = await getIdToken();
        config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If no token available (user not logged in), continue without auth header
      // Public endpoints don't require authentication
      console.log('No auth token available, continuing without authentication');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    // Return only the data from successful responses
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
          window.location.href = '/login?expired=true';
        }
      }

      if (status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden:', data);
      }

      // Return structured error
      return Promise.reject({
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || 'An unexpected error occurred',
        statusCode: status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
      });
    } else {
      // Something else went wrong
      return Promise.reject({
        code: 'REQUEST_ERROR',
        message: error.message || 'An error occurred while making the request',
        statusCode: 0,
      });
    }
  }
);

// ============================================
// API ERROR TYPE
// ============================================

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

// ============================================
// EXPORTS
// ============================================

export default apiClient;

// Export typed API client methods
export const api = {
  get: <T = any>(url: string, config?: any): Promise<ApiSuccessResponse<T>> =>
    apiClient.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: any): Promise<ApiSuccessResponse<T>> =>
    apiClient.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any): Promise<ApiSuccessResponse<T>> =>
    apiClient.put(url, data, config),
  
  delete: <T = any>(url: string, config?: any): Promise<ApiSuccessResponse<T>> =>
    apiClient.delete(url, config),
  
  patch: <T = any>(url: string, data?: any, config?: any): Promise<ApiSuccessResponse<T>> =>
    apiClient.patch(url, data, config),
};
