import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll to the top on page changes (but not when only the query string changes)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
