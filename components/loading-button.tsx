"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLoading } from "@/lib/loading-context";
import { Loader2 } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { useState } from "react";

interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  href?: string;
  loadingText?: string;
  showInlineLoader?: boolean;
  showGlobalLoader?: boolean;
}

export function LoadingButton({
  href,
  loadingText,
  showInlineLoader = true,
  showGlobalLoader = true,
  children,
  onClick,
  disabled,
  ...props
}: LoadingButtonProps) {
  const router = useRouter();
  const { startLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // If there's an onClick handler, call it first
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    // If there's an href, navigate
    if (href && !disabled && !isLoading) {
      setIsLoading(true);

      if (showGlobalLoader) {
        startLoading(loadingText || "Loading...");
      }

      router.push(href);
    }
  };

  const isButtonDisabled = disabled || isLoading;

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={isButtonDisabled}
    >
      {isLoading && showInlineLoader ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
