import type { SVGProps } from "react";
import { Book, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  isSidebarExpanded?: boolean;
}

export function Logo({
  className,
  isSidebarExpanded = true,
  ...props
}: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      <Book
        className={cn(
          "transition-all duration-300",
          !isSidebarExpanded ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}
        {...props}
      />
      <BookOpenCheck
        className={cn(
          "absolute top-0 left-0 transition-all duration-300",
          isSidebarExpanded ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}
        {...props}
      />
    </div>
  );
}
