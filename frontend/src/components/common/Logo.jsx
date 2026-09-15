import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LogoMark = ({ className }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
    <rect width="32" height="32" rx="9" className="fill-primary" />
    <path
      d="M10.5 8.5v13M21.5 8.5v13M10.5 15h11"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      className="text-primary-foreground"
    />
    <path
      d="M7 25c3-1.6 6-1.6 9 0s6 1.6 9 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      className="text-highlight"
    />
  </svg>
);

const Logo = ({ to = "/", className, showText = true }) => (
  <Link
    to={to}
    aria-label="HireStream home"
    className={cn("inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground", className)}
  >
    <LogoMark />
    {showText && (
      <span>
        Hire<span className="text-primary">Stream</span>
      </span>
    )}
  </Link>
);

export default Logo;
