import { Outlet, useNavigation } from "react-router-dom";
import ChatWidget from "@/features/ai/components/ChatWidget";
import { useGetMeQuery } from "@/features/auth/api";
import ScrollToTop from "./ScrollToTop";

const RootLayout = () => {
  // Confirms the session cookie on every app load; the stored user may be outdated or expired
  useGetMeQuery();
  const navigation = useNavigation();

  return (
    <>
      <ScrollToTop />
      {navigation.state === "loading" && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-primary" role="progressbar" aria-label="Loading page" />
      )}
      <Outlet />
      <ChatWidget />
    </>
  );
};

export default RootLayout;
