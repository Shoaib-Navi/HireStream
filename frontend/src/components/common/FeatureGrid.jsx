import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LAYOUTS = {
  2: { grid: "sm:grid-cols-2", cell: "sm:odd:border-r" },
  4: { grid: "sm:grid-cols-2 lg:grid-cols-4", cell: "sm:odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0" },
};

// Numbered items (01, 02…) separated by hairlines. Items with `to` become links.
const FeatureGrid = ({ items, columns = 4, className }) => {
  const layout = LAYOUTS[columns] ?? LAYOUTS[4];

  return (
    <ul className={cn("grid border-t", layout.grid, className)}>
      {items.map((item, index) => {
        const content = (
          <>
            <span className="type-h4 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            <div className="mt-12 sm:mt-20">
              <h3 className="type-h3 text-foreground">{item.title}</h3>
              <p className="type-body mt-2 max-w-sm text-muted-foreground">{item.description}</p>
              {item.to && (
                <span className="type-label mt-6 inline-flex items-center gap-1.5 text-foreground">
                  {item.cta ?? "Explore"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              )}
            </div>
          </>
        );

        return (
          <li key={item.title} className={cn("border-b", layout.cell)}>
            {item.to ? (
              <Link to={item.to} className="group block h-full p-6 transition-colors hover:bg-accent sm:p-8">
                {content}
              </Link>
            ) : (
              <div className="h-full p-6 sm:p-8">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FeatureGrid;
