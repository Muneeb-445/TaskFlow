import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ isLoggedIn }) {
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}