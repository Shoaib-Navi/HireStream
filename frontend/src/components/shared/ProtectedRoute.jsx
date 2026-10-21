import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// UX guard only: the API enforces the same role and ownership rules on every request
const ProtectedRoute = ({ roles }) => {
  const { user, sessionChecked } = useSelector((store) => store.auth);
  const location = useLocation();

  if (!user) {
    // wait for the session check before deciding (the cookie may still be valid)
    if (!sessionChecked) return null;
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
