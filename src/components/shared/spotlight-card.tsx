"use client";

import React, { useRef, memo, type MouseEvent, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * A performance-optimized SpotlightCard that uses CSS variables 
 * to handle hover effects without triggering React re-renders.
 */
export const SpotlightCard = memo(React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      const card = internalRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
      }
    };

    return (
      <Card
        ref={(node) => {
          (internalRef as any).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        className={cn("spotlight-card relative overflow-hidden transition-all duration-500", className)}
        {...props}
      >
        {children}
      </Card>
    );
  }
));

SpotlightCard.displayName = "SpotlightCard";
