import { cn } from "@/lib/utils";

const DEFAULT_LINE_COLOR = "color-mix(in oklab, var(--foreground) 7%, transparent)";

// Decorative grid behind its children, fading out towards the edges
const GridBackground = ({ className, size = 40, lineColor = DEFAULT_LINE_COLOR, fade = true, children }) => {
  const mask = "radial-gradient(ellipse 80% 70% at 50% 35%, black 25%, transparent 100%)";

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          ...(fade && { maskImage: mask, WebkitMaskImage: mask }),
        }}
      />
      {children}
    </div>
  );
};

export default GridBackground;
