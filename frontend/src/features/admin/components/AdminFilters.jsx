import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all";

// Search box and dropdown filters shared by the admin lists
export const AdminSearch = ({ value, onChange, placeholder = "Search" }) => (
  <div className="relative w-full sm:max-w-xs">
    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    <Input
      type="search"
      className="pl-9"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

// value is "" when no filter is applied
export const FilterSelect = ({ label, value, options, onChange }) => (
  <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
    <SelectTrigger className="w-full sm:w-44" aria-label={label}>
      <SelectValue placeholder={label} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
