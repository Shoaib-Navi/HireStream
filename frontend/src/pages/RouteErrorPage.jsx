import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

// After a new deploy, lazily loaded pages from the old build no longer exist
const isChunkLoadError = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed/i.test(String(error?.message ?? error));

// Shown instead of a blank screen when a page crashes while rendering or loading
const RouteErrorPage = () => {
  const error = useRouteError();
  const outdated = isChunkLoadError(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-destructive">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </div>
      <h1 className="type-h2 text-foreground">{outdated ? "A new version is available" : "Something went wrong"}</h1>
      <p className="type-body max-w-md text-muted-foreground">
        {outdated
          ? "HireStream was updated while you were browsing. Reload the page to continue."
          : "An unexpected error occurred. Reload the page or go back home."}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Reload page</Button>
        {/* full page load so the app starts from a clean state */}
        <Button asChild variant="outline">
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
};

export default RouteErrorPage;
