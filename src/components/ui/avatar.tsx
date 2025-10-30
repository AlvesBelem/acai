import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-700",
        className
      )}
      {...props}
    />
  );
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <img className={cn("h-full w-full object-cover", className)} {...props} />;
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

