import { Outlet } from "react-router-dom";
import Footer from "./Footer";

// Public pages share the footer; auth and recruiter pages don't show it
const SiteLayout = () => (
  <>
    <Outlet />
    <Footer />
  </>
);

export default SiteLayout;
