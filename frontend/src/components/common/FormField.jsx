import { useEffect, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Label style that goes with the underline field variants
export const FIELD_LABEL = "type-label text-muted-foreground";

// Label + control + error or hint text. Pass aria-invalid to the control yourself.
const FormField = ({ label, htmlFor, error, hint, required, className, labelClassName, children }) => {
  const messageId = useId();
  const message = error || hint;

  // The control is whatever element carries the id the label points at (an input, a select trigger,
  // a date button…), so the message is tied to it by id rather than through each control's props
  useEffect(() => {
    const control = htmlFor && document.getElementById(htmlFor);
    if (!control) return undefined;
    if (message) control.setAttribute("aria-describedby", messageId);
    else control.removeAttribute("aria-describedby");
    return () => control.removeAttribute("aria-describedby");
  }, [htmlFor, message, messageId]);

  return (
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
          push the rest of the form down; it's announced politely instead of as an alert,
          so a form with several errors doesn't read them all out at once */}
      <p
        id={messageId}
        aria-live="polite"
        className={cn("type-caption min-h-[1.219rem]", error ? "text-destructive" : "text-muted-foreground")}
      >
        {message}
      </p>
    </div>
  );
};

export default FormField;
