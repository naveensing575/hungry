"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Loader } from "@/components/ui/loader";

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(
    fn: () => Promise<T>,
    text?: string
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const startLoading = useCallback((text = "Loading...") => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText("");
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>, text = "Loading...") => {
      try {
        startLoading(text);
        const result = await fn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading, loadingText, startLoading, stopLoading, withLoading }}
    >
      {children}
      {isLoading && <Loader fullScreen size="lg" text={loadingText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
