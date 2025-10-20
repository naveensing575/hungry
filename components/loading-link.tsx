"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/lib/loading-context";
import type { ReactNode } from "react";

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function LoadingLink({
  href,
  children,
  loadingText = "Loading...",
  className,
  onClick,
}: LoadingLinkProps) {
  const router = useRouter();
  const { startLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    startLoading(loadingText);
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
