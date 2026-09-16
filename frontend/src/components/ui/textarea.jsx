import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "placeholder:text-muted-foreground flex field-sizing-content min-h-20 w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input dark:bg-input/30 rounded-md border px-3 py-2 shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Hairline rule instead of a box, matching the underline input
        underline:
          "rounded-none border-0 border-b px-0 py-2 hover:border-foreground/40 focus-visible:border-primary aria-invalid:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Textarea({ className, variant, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props} />
  );
}

export { Textarea, textareaVariants }
