import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Logo komponent, który może być wyświetlany w różnych rozmiarach
 * @param size - rozmiar logo:
 * - "sm" (mały - 32px/h-8)
 * - "md" (średni - 64px/h-16)
 * - "lg" (duży - 96px/h-24)
 * - "xl" (bardzo duży - 160px/h-40)
 * @param className - dodatkowe klasy CSS
 */
export function Logo({ size = "sm", className, ...props }: LogoProps) {
  const sizeClasses = {
    sm: "h-8", // 32px
    md: "h-16", // 64px
    lg: "h-24", // 96px
    xl: "h-40", // 160px
  };

  return (
    <div className={cn("flex items-center justify-center", sizeClasses[size], className)} {...props}>
      <img src="/images/logo.png" alt="ShopListeo Logo" className={cn("object-contain", sizeClasses[size])} />
    </div>
  );
}
