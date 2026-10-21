import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Label style that goes with the underline field variants
export const FIELD_LABEL = "type-label text-muted-foreground";

// Label + control + error or hint text. Pass aria-invalid to the control yourself.
const FormField = ({ label, htmlFor, error, hint, required, className, labelClassName, children }) => (
  <div className={cn("grid gap-1.5", className)}>
    {label && (
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
    )}
    {children}
    {error ? (
      <p className="type-caption text-destructive" role="alert">
        {error}
      </p>
    ) : (
      hint && <p className="type-caption text-muted-foreground">{hint}</p>
    )}
  </div>
);

export default FormField;
