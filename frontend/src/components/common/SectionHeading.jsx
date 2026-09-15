import { cn } from "@/lib/utils";
import ScrambleText from "./ScrambleText";

const SectionHeading = ({ eyebrow, title, description, align = "left", className }) => (
  <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center", className)}>
    {eyebrow && <ScrambleText text={eyebrow} className="type-label block text-muted-foreground" />}
    <h2 className="type-h1 max-w-4xl text-foreground">{title}</h2>
    {description && <p className="type-body-lg max-w-2xl text-muted-foreground">{description}</p>}
  </div>
);

export default SectionHeading;
