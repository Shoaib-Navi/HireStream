import { cn } from "@/lib/utils";

// Titled card used for form sections and settings panels
const SectionCard = ({ id, title, description, action, footer, className, children }) => (
  <section id={id} className={cn("scroll-mt-24 rounded-xl border bg-card shadow-card", className)}>
    <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h2 className="type-h4 text-foreground">{title}</h2>
        {description && <p className="type-caption mt-0.5 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="px-5 py-5 sm:px-6">{children}</div>
    {footer && (
      <div className="flex flex-wrap justify-end gap-2 rounded-b-xl border-t bg-surface px-5 py-3 sm:px-6">{footer}</div>
    )}
  </section>
);

export default SectionCard;
