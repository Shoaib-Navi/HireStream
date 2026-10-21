import { Navigate, useParams } from "react-router-dom";

// Old links looked like /description/:id
const LegacyJobRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/jobs/${id}`} replace />;
};

export default LegacyJobRedirect;
