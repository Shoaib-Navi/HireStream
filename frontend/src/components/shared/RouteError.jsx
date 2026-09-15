import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

// Shown instead of a blank screen when a page crashes while rendering
const RouteError = () => {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-sm text-gray-500 max-w-sm">
        An unexpected error occurred. Please reload the page or go back home.
      </p>
      {/* full page load so the app starts from a clean state */}
      <a
        href="/"
        className="mt-2 px-5 py-2.5 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-colors"
      >
        Go home
      </a>
    </div>
  );
};

export default RouteError;
