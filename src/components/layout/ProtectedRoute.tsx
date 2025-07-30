import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/use-auth";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
