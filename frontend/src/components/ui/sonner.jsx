import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import StatusIcon from "@/components/common/StatusIcon";

// Toasts are fully styled here (unstyled mode) so they read like the rest of the app: a flat popover
// card with a hairline border, and the same status chip used by error panels and empty states.
// Top right, so they never sit under the assistant button in the bottom corner.
const ICONS = {
  success: <StatusIcon tone="success" size="xs" />,
  info: <StatusIcon tone="info" size="xs" />,
  warning: <StatusIcon tone="warning" size="xs" />,
  error: <StatusIcon tone="error" size="xs" />,
  loading: <StatusIcon tone="progress" size="xs" />,
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
            "group relative flex w-(--width) items-start gap-3 rounded-lg border bg-popover p-3 pr-11 text-popover-foreground shadow-elevated",
          icon: "shrink-0",
          content: "flex min-h-8 min-w-0 flex-1 flex-col justify-center gap-0.5",
          title: "type-body font-medium text-foreground",
          description: "type-caption text-muted-foreground",
          actionButton: "type-label shrink-0 self-center rounded-md bg-primary px-3 py-1.5 text-primary-foreground",
          cancelButton: "type-label shrink-0 self-center rounded-md border px-3 py-1.5 text-muted-foreground",
          closeButton:
            "absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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
