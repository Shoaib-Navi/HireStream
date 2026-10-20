import { Outlet, useNavigation } from "react-router-dom";
import { useGetMeQuery } from "@/features/auth/api";
import ScrollToTop from "./ScrollToTop";

const RootLayout = () => {
  // Confirms the session cookie on every app load; the stored user may be outdated or expired
  useGetMeQuery();
  const navigation = useNavigation();

  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-[3px] focus:ring-ring/50"
      >
        Skip to content
      </a>
      {navigation.state === "loading" && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-primary" role="progressbar" aria-label="Loading page" />
      )}
      <Outlet />
    </>
  );
};

export default RootLayout;
