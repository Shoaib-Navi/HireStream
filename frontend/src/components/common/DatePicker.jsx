import { useState } from "react";
import { CalendarDays } from "lucide-react";
import Calendar from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Reads and writes the same "YYYY-MM-DD" string a date input would, so forms keep their shape.
// Parsing by parts keeps the date in local time; new Date("2026-01-05") would shift by timezone.
const toDate = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day) ? new Date(year, month - 1, day) : null;
};

const toValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Opens in the popover the rest of the app uses, so it shares the same motion
const DatePicker = ({ id, value, onChange, min, max, placeholder = "Pick a date", disabled, invalid, className }) => {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-2 border-b bg-transparent text-left transition-colors outline-none",
            "hover:border-foreground/40 focus-visible:border-primary disabled:pointer-events-none disabled:opacity-50",
            "aria-invalid:border-destructive",
            className,
          )}
        >
          <span className={cn("text-base", selected ? "text-foreground" : "type-label text-muted-foreground")}>
            {selected ? formatDate(selected) : placeholder}
          </span>
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          value={selected}
          min={toDate(min)}
          max={toDate(max)}
          onSelect={(date) => {
            onChange(toValue(date));
            setOpen(false);
          }}
        />
        {selected && (
          <div className="border-t p-1.5">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="type-label w-full rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Clear date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
