import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/common/Spinner";
import { getDashboardHome } from "@/config/navigation";
import { useAuth } from "../hooks/useAuth";

// Route guard for UX only: the API enforces the same role and ownership rules on every request
const RequireAuth = ({ roles }) => {
  const { user, sessionChecked } = useAuth();
  const location = useLocation();

  if (!user) {
    // wait for the session check before redirecting (the cookie may still be valid)
    if (!sessionChecked) return <PageLoader />;
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardHome(user.role)} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
