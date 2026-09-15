import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

// Default, lg and xl buttons use the uppercase label style; sm and icon buttons stay compact
const LABEL_STYLE = "text-xs font-semibold uppercase tracking-[0.12em]"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/60 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        highlight: "bg-highlight text-highlight-foreground hover:bg-highlight/90",
        soft: "bg-primary-soft text-foreground hover:bg-primary-soft/70",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/75",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
      },
      size: {
        default: `h-10 px-5 has-[>svg]:px-4 ${LABEL_STYLE}`,
        sm: "h-8 gap-1.5 px-3 text-sm font-medium has-[>svg]:px-2.5",
        lg: `h-12 px-7 has-[>svg]:px-6 ${LABEL_STYLE}`,
        xl: `h-14 px-8 has-[>svg]:px-7 ${LABEL_STYLE}`,
        icon: "size-10",
        "icon-sm": "size-8 text-sm font-medium",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
