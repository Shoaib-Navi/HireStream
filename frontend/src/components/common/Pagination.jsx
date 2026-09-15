import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GAP = "gap";

// [1, "gap", 4, 5, 6, "gap", 12]
const getPageItems = (page, totalPages) => {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((item, index) => (index > 0 && item - sorted[index - 1] > 1 ? [GAP, item] : [item]));
};

const Pagination = ({ page, totalPages, onPageChange, className }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
      </Button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === GAP ? (
          <span key={`gap-${index}`} className="px-1.5 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={item}
            size="icon-sm"
            variant={item === page ? "default" : "ghost"}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        <span className="hidden sm:inline">Next</span> <ChevronRight />
      </Button>
    </nav>
  );
};

export default Pagination;
