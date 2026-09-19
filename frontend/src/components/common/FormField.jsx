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
    {/* the message keeps its line whether or not there is one, so validation does not
        push the rest of the form down */}
    <p
      className={cn("type-caption min-h-[1.219rem]", error ? "text-destructive" : "text-muted-foreground")}
      role={error ? "alert" : undefined}
    >
      {error || hint}
    </p>
  </div>
);

export default FormField;
