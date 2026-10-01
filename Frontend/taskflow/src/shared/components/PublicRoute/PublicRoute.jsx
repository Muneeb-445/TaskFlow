import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute({ isLoggedIn }) {
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}