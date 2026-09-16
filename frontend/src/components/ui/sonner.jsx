import { AlertTriangle, CheckCircle2, Info, Loader2, OctagonAlert } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

// Top right, so toasts never sit under the assistant button in the bottom corner.
// Icons and tones match StatusIcon, so a toast reads like the rest of the app's states.
const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4 text-success" />,
        info: <Info className="size-4 text-info" />,
        warning: <AlertTriangle className="size-4 text-warning" />,
        error: <OctagonAlert className="size-4 text-destructive" />,
        loading: <Loader2 className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group items-start gap-3 rounded-md border bg-popover p-4 text-popover-foreground shadow-elevated",
          title: "type-body font-medium text-foreground",
          description: "type-caption text-muted-foreground",
          actionButton: "type-label rounded-md bg-primary px-3 py-1.5 text-primary-foreground",
          cancelButton: "type-label rounded-md border px-3 py-1.5 text-muted-foreground",
          closeButton: "border bg-popover text-muted-foreground hover:text-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        }
      }
      {...props} />
  );
}

export { Toaster }
