import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data: T;
  count?: number;
  timestamp?: string;
  error?: string;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async <T,>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T> | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('API Error:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchData, loading, error, setError };
};
