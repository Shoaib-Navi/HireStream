import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Public pages: navbar, page content and footer
const SiteLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main id="main" className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default SiteLayout;
