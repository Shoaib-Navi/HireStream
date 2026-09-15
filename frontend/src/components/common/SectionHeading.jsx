import { cn } from "@/lib/utils";

const SectionHeading = ({ eyebrow, title, description, align = "center", className }) => (
  <div className={cn("space-y-3", align === "center" && "mx-auto max-w-2xl text-center", className)}>
    {eyebrow && <p className="type-overline text-primary">{eyebrow}</p>}
    <h2 className="type-h1 text-foreground">{title}</h2>
    {description && <p className="type-body-lg text-muted-foreground">{description}</p>}
  </div>
);

export default SectionHeading;
