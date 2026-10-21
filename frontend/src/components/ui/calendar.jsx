import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Month grid built from scratch so it follows the theme instead of the browser's own picker.
// Weeks start on Monday.
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a, b) =>
  Boolean(a && b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// getDay() is Sunday-first; shift it so Monday is the first column
const leadingBlanks = (firstOfMonth) => (firstOfMonth.getDay() + 6) % 7;

const Calendar = ({ value, onSelect, min, max, className }) => {
  const [view, setView] = useState(() => {
    const base = value ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: leadingBlanks(view) }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(view.getFullYear(), view.getMonth(), index + 1)),
    ];
  }, [view]);

  const today = startOfDay(new Date());
  const isDisabled = (date) => (min && date < startOfDay(min)) || (max && date > startOfDay(max));
  const shiftMonth = (months) => setView((current) => new Date(current.getFullYear(), current.getMonth() + months, 1));

  const navButton = "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div className={cn("w-[17.5rem] p-3", className)}>
      <div className="flex items-center justify-between gap-2 pb-3">
        <button type="button" className={navButton} onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </button>
        <p className="type-label text-foreground" aria-live="polite">
          {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <button type="button" className={navButton} onClick={() => shiftMonth(1)} aria-label="Next month">
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 border-t pt-3">
        {WEEKDAYS.map((day) => (
          <div key={day} className="type-caption flex h-7 items-center justify-center text-muted-foreground">
            {day}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} />;

          const selected = isSameDay(date, value);
          const disabled = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(date)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                selected
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
                !selected && isSameDay(date, today) && "ring-1 ring-border",
                disabled && "pointer-events-none text-muted-foreground/40",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
