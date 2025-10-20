"use client";

import { useState, useCallback } from "react";
import { useLoading } from "@/lib/loading-context";

interface UseApiLoadingOptions {
  loadingText?: string;
  showGlobalLoader?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useApiLoading<T = unknown>(
  options: UseApiLoadingOptions = {}
) {
  const {
    loadingText = "Loading...",
    showGlobalLoader = false,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const globalLoading = useLoading();

  const execute = useCallback(
    async (apiFn: () => Promise<T>) => {
      try {
        setIsLoading(true);
        setError(null);

        if (showGlobalLoader) {
          globalLoading.startLoading(loadingText);
        }

        const result = await apiFn();
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred");
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
        if (showGlobalLoader) {
          globalLoading.stopLoading();
        }
      }
    },
    [loadingText, showGlobalLoader, globalLoading, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
}
