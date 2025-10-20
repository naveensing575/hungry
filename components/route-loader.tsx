"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/lib/loading-context";

export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { stopLoading } = useLoading();

  useEffect(() => {
    // Stop loading when route changes
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  return null;
}
