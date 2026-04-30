import { useState, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (url: string, init?: RequestInit) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Hook réutilisable pour les appels API avec gestion d'état
 * et AbortController pour le cleanup
 */
export function useApi<T>(options?: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    url: string,
    init?: RequestInit
  ): Promise<T | undefined> => {
    // Annuler la requête précédente si encore en cours
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))
        : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${url}`,
        {
          ...init,
          signal: abortRef.current.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...init?.headers,
          },
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const message = errJson.message
          || errJson.error
          || `Erreur HTTP ${response.status}`;
        throw new Error(message);
      }

      const json = await response.json();
      const result = (json.data || json) as T;
      setData(result);
      options?.onSuccess?.(result);
      return result;

    } catch (err: any) {
      if (err.name === 'AbortError') return undefined;
      const message = err.message || 'Erreur inattendue';
      setError(message);
      options?.onError?.(message);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}

/**
 * Hook pour les requêtes GET avec chargement automatique
 */
export function useApiGet<T>(
  url: string | null,
  options?: UseApiOptions<T>
) {
  const { data, isLoading, error, execute, reset } = useApi<T>(options);

  const fetchData = useCallback(() => {
    if (!url) return;
    return execute(url);
  }, [url, execute]);

  return { data, isLoading, error, fetchData, reset };
}
