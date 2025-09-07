// hooks/useApiError.ts
import { useState } from 'react';
import { debugApiError } from '../utils/debugUtils';

export interface ApiError {
  message: string;
  details?: Record<string, string[]> | string;
  status?: number;
  validationErrors?: Record<string, string[]>;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = (err: any) => {
    // Debug the error first
    const errorData = debugApiError(err);
    
    if (err.response?.status === 422) {
      // Handle validation errors - check common response formats
      const validationErrors = errorData?.errors || errorData?.detail || errorData;
      
      setError({
        message: 'Validation failed. Please check your input.',
        details: typeof validationErrors === 'string' ? validationErrors : 'See validation errors below',
        validationErrors: typeof validationErrors === 'object' ? validationErrors : undefined,
        status: 422
      });
    } else if (errorData?.detail) {
      setError({
        message: errorData.detail,
        status: err.response?.status
      });
    } else if (errorData?.message) {
      setError({
        message: errorData.message,
        status: err.response?.status
      });
    } else {
      setError({
        message: err.message || 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};