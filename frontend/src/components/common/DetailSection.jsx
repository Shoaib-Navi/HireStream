import { cn } from "@/lib/utils";

// Label on the left, content on the right, separated from the previous section by a hairline
const DetailSection = ({ title, className, children }) => (
  <section className={cn("grid gap-4 border-t py-8 sm:grid-cols-[11rem_1fr] sm:gap-8", className)}>
    <h2 className="type-label pt-1 text-muted-foreground">{title}</h2>
    <div className="type-body-lg min-w-0 text-foreground">{children}</div>
  </section>
);

export default DetailSection;
