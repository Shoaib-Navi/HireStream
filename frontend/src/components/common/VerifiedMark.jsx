import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Size comes from the caller, so the mark matches the text it sits next to
const VerifiedMark = ({ className }) => (
  <BadgeCheck role="img" aria-label="Verified company" className={cn("size-4 shrink-0 text-success", className)} />
);

export default VerifiedMark;
