import { X } from "lucide-react";
import CheckboxGroup from "@/components/common/CheckboxGroup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPLOYMENT_TYPES, EXPERIENCE_FILTERS, SALARY_FILTERS, WORK_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ANY = "any";

// A checked option reads stronger than the rest of its list, so the panel shows what is on at a glance
const OPTION_ROW = "gap-3";
const OPTION_LABEL =
  "w-full cursor-pointer py-0.5 font-normal text-muted-foreground transition-colors peer-data-[state=checked]:font-medium peer-data-[state=checked]:text-foreground";

const Section = ({ children }) => <div className="border-t pt-5">{children}</div>;

const SelectFilter = ({ label, value, options, anyLabel, onChange }) => (
  <div className="space-y-2.5">
    <p className="type-overline text-muted-foreground">{label}</p>
    <Select value={value || ANY} onValueChange={(next) => onChange(next === ANY ? "" : next)}>
      {/* a chosen value darkens the border, so a set filter reads as set without opening it */}
      <SelectTrigger className={cn("w-full", value && "border-foreground/30")} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// idPrefix keeps element ids unique when the desktop panel and mobile sheet are both mounted.
// The heading is desktop-only: the mobile sheet already carries its own "Filters" title.
const JobFilters = ({ filters, onChange, onClear, activeCount = 0, idPrefix = "filters" }) => (
  <div className="space-y-5">
    <div className={cn("flex items-center justify-between gap-2", activeCount === 0 && "hidden lg:flex")}>
      <div className="flex items-center gap-2">
        <p className="type-label hidden text-foreground lg:block">Filters</p>
        {activeCount > 0 && <Badge variant="count">{activeCount}</Badge>}
      </div>
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2 h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>

    <Section>
      <CheckboxGroup
        legend="Work mode"
        options={WORK_MODES}
        value={filters.workMode}
        onChange={(workMode) => onChange({ workMode })}
        idPrefix={`${idPrefix}-mode`}
        optionsClassName="space-y-1.5"
        rowClassName={OPTION_ROW}
        labelClassName={OPTION_LABEL}
      />
    </Section>

    <Section>
      <CheckboxGroup
        legend="Job type"
        options={EMPLOYMENT_TYPES}
        value={filters.employmentType}
        onChange={(employmentType) => onChange({ employmentType })}
        idPrefix={`${idPrefix}-type`}
        optionsClassName="space-y-1.5"
        rowClassName={OPTION_ROW}
        labelClassName={OPTION_LABEL}
      />
    </Section>

    <Section>
      <SelectFilter
        label="Experience"
        value={filters.experience}
        options={EXPERIENCE_FILTERS}
        anyLabel="Any experience"
        onChange={(experience) => onChange({ experience })}
      />
    </Section>

    <Section>
      <SelectFilter
        label="Salary"
        value={filters.salaryMin}
        options={SALARY_FILTERS}
        anyLabel="Any salary"
        onChange={(salaryMin) => onChange({ salaryMin })}
      />
    </Section>
  </div>
);

export default JobFilters;
