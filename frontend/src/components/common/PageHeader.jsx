import { cn } from "@/lib/utils";

const PageHeader = ({ eyebrow, title, description, actions, className }) => (
  <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
    <div className="min-w-0 space-y-1.5">
      {eyebrow && <p className="type-overline text-primary">{eyebrow}</p>}
      <h1 className="type-h2 text-foreground">{title}</h1>
      {description && <p className="type-body max-w-2xl text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
