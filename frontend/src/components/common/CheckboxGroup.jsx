import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Multi-select list of checkboxes. value is the array of selected option values.
const CheckboxGroup = ({ legend, options, value = [], onChange, idPrefix, className, optionsClassName }) => (
  <fieldset className={cn("space-y-3", className)}>
    {legend && <legend className="type-overline mb-3 text-muted-foreground">{legend}</legend>}
    <div className={cn("space-y-2.5", optionsClassName)}>
      {options.map((option) => {
        const id = `${idPrefix}-${option.value}`;
        return (
          <div key={option.value} className="flex items-center gap-2.5">
            <Checkbox
              id={id}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) =>
                onChange(checked ? [...value, option.value] : value.filter((item) => item !== option.value))
              }
            />
            <Label htmlFor={id} className="font-normal">
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  </fieldset>
);

export default CheckboxGroup;
