import CheckboxGroup from "@/components/common/CheckboxGroup";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPLOYMENT_TYPES, EXPERIENCE_FILTERS, SALARY_FILTERS, WORK_MODES } from "@/lib/constants";

const ANY = "any";

const SelectFilter = ({ label, value, options, anyLabel, onChange }) => (
  <div className="space-y-3">
    <p className="type-overline text-muted-foreground">{label}</p>
    <Select value={value || ANY} onValueChange={(next) => onChange(next === ANY ? "" : next)}>
      <SelectTrigger className="w-full" aria-label={label}>
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

// idPrefix keeps element ids unique when the desktop panel and mobile sheet are both mounted
const JobFilters = ({ filters, onChange, onClear, idPrefix = "filters" }) => (
  <div className="space-y-7">
    <CheckboxGroup
      legend="Work mode"
      options={WORK_MODES}
      value={filters.workMode}
      onChange={(workMode) => onChange({ workMode })}
      idPrefix={`${idPrefix}-mode`}
    />
    <CheckboxGroup
      legend="Job type"
      options={EMPLOYMENT_TYPES}
      value={filters.employmentType}
      onChange={(employmentType) => onChange({ employmentType })}
      idPrefix={`${idPrefix}-type`}
    />
    <SelectFilter
      label="Experience"
      value={filters.experience}
      options={EXPERIENCE_FILTERS}
      anyLabel="Any experience"
      onChange={(experience) => onChange({ experience })}
    />
    <SelectFilter
      label="Salary"
      value={filters.salaryMin}
      options={SALARY_FILTERS}
      anyLabel="Any salary"
      onChange={(salaryMin) => onChange({ salaryMin })}
    />
    <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
      Clear all filters
    </Button>
  </div>
);

export default JobFilters;
