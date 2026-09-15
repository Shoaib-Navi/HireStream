import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import api from "@/lib/api";
import { setSessionChecked, setUser } from "@/redux/authSlice";
import ScrollToTop from "./ScrollToTop";
import Navbar from "./Navbar";
import ChatBot from "./ChatBot";

const Layout = () => {
  const dispatch = useDispatch();

  // Confirm the cookie session on load: the stored user may be outdated or the cookie expired.
  // A 401 clears the user through the api interceptor.
  useEffect(() => {
    api
      .get("/user/me")
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => {})
      .finally(() => dispatch(setSessionChecked(true)));
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <ChatBot />
    </>
  );
};

export default Layout;
