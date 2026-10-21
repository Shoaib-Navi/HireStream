import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const BackLink = ({ to, children, className }) => (
  <Link
    to={to}
    className={cn("type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground", className)}
  >
    <ArrowLeft className="size-3.5" /> {children}
  </Link>
);

export default BackLink;
