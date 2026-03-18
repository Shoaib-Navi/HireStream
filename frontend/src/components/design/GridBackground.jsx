/**
 * GridBackground — drop-in reusable background grid component
 *
 * USAGE:
 *   <GridBackground>
 *     <YourContent />
 *   </GridBackground>
 *
 *   <GridBackground variant="dots" fade="bottom" color="violet">
 *     <YourContent />
 *   </GridBackground>
 *
 * PROPS:
 *   variant  : "lines" | "dots" | "cross"   (default: "lines")
 *   fade     : "none" | "bottom" | "top" | "both" | "radial"  (default: "radial")
 *   color    : "violet" | "blue" | "slate" | "neutral"  (default: "violet")
 *   size     : number — grid cell size in px  (default: 40)
 *   className: extra classes on the wrapper
 *   children : your content rendered above the grid
 */
 
import React from "react";
import { cn } from "@/lib/utils"; // shadcn cn utility
 
/* ── Color palettes ─────────────────────────────────── */
const COLORS = {
  violet:  "rgba(124, 58, 237, 0.5)",
  blue:    "rgba(59, 130, 246, 0.5)",
  slate:   "rgba(100, 116, 139, 0.5)",
  neutral: "rgba(0, 0, 0, 0.07)",
};
 
/* ── Fade overlays ───────────────────────────────────── */
const FADES = {
  none:    "none",
  bottom:  "linear-gradient(to bottom, transparent 40%, white 100%)",
  top:     "linear-gradient(to top, transparent 40%, white 100%)",
  both:    "linear-gradient(to bottom, white 0%, transparent 20%, transparent 80%, white 100%)",
  radial:  "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, white 100%)",
};
 
/* ── SVG pattern builders ────────────────────────────── */
const buildLinesSVG = (size, color) => {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="0.8"/>
    </svg>`
  );
  return `url("data:image/svg+xml,${encoded}")`;
};
 
const buildDotsSVG = (size, color) => {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="1" cy="1" r="1.2" fill="${color}"/>
    </svg>`
  );
  return `url("data:image/svg+xml,${encoded}")`;
};
 
const buildCrossSVG = (size, color) => {
  const half = size / 2;
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <path d="M ${half} ${half - 4} L ${half} ${half + 4} M ${half - 4} ${half} L ${half + 4} ${half}"
        stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="0.4" opacity="0.5"/>
    </svg>`
  );
  return `url("data:image/svg+xml,${encoded}")`;
};
 
/* ── Main Component ──────────────────────────────────── */
const GridBackground = ({
  variant  = "lines",
  fade     = "radial",
  color    = "violet",
  size     = 40,
  className,
  children,
}) => {
  const gridColor = COLORS[color] ?? COLORS.violet;
  const fadeOverlay = FADES[fade] ?? FADES.radial;
 
  const patternImage =
    variant === "dots"  ? buildDotsSVG(size, gridColor)  :
    variant === "cross" ? buildCrossSVG(size, gridColor) :
                          buildLinesSVG(size, gridColor);
 
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
 
      {/* ── Grid layer ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: patternImage, backgroundSize: `${size}px ${size}px` }}
      />
 
      {/* ── Fade mask layer ── */}
      {fade !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: fadeOverlay }}
        />
      )}
 
      {/* ── Content slot ── */}
      <div className="relative z-10">
        {children}
      </div>
 
    </div>
  );
};
 
export default GridBackground;