import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * `height` sets the size; the width follows from the mark's aspect ratio.
 * Colour comes from `currentColor`, so it flips with the theme on its own.
 */
export function Wordmark({ className }: { className?: string }) {
  return <span role="img" aria-label={site.name} className={cn("wordmark", className)} />;
}
