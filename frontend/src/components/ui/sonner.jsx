import { AlertTriangle, Loader2, OctagonAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

// Toasts are fully styled here (unstyled mode) so they read like the rest of the app: a flat popover
// card with a hairline border. Like most product UIs, confirmations are plain text; only problems
// carry a small inline icon so they stand out. Top right, so they never sit under the assistant button.
const ICONS = {
  success: null,
  info: null,
  warning: <AlertTriangle className="size-4 text-warning" />,
  error: <OctagonAlert className="size-4 text-destructive" />,
  loading: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
};

const Toaster = (props) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-right"
      closeButton
      icons={ICONS}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group relative flex w-(--width) items-start gap-3 rounded-lg border bg-popover py-3.5 pr-11 pl-4 text-popover-foreground shadow-elevated",
          icon: "mt-1 shrink-0",
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "type-body font-medium text-foreground",
          description: "type-caption text-muted-foreground",
          actionButton: "type-label shrink-0 self-center rounded-md bg-primary px-3 py-1.5 text-primary-foreground",
          cancelButton: "type-label shrink-0 self-center rounded-md border px-3 py-1.5 text-muted-foreground",
          closeButton:
            "absolute top-3.5 right-3 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        },
      }}
      // Sonner still colors the close button in its dark theme; point it at the same tokens
      style={{
        "--normal-bg": "transparent",
        "--normal-bg-hover": "var(--accent)",
        "--normal-border": "transparent",
        "--normal-border-hover": "transparent",
        "--normal-text": "var(--muted-foreground)",
      }}
      {...props}
    />
  );
};

export { Toaster };
