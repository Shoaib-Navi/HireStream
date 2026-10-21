import { useSelector } from "react-redux";
import { ROLES } from "@/lib/constants";
import { selectCurrentUser, selectSessionChecked } from "../authSlice";

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const sessionChecked = useSelector(selectSessionChecked);

  return {
    user,
    sessionChecked,
    isAuthenticated: Boolean(user),
    isCandidate: user?.role === ROLES.CANDIDATE,
    isRecruiter: user?.role === ROLES.RECRUITER,
    isAdmin: user?.role === ROLES.ADMIN,
  };
};
