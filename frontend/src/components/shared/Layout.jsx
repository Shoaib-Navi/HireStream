import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import ChatBot from "./ChatBot";

const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <ChatBot/>
    </>
  );
};

export default Layout;