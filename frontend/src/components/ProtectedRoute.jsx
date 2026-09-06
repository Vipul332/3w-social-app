import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from './Loading';

/**
 * Guards routes that require authentication. While the auth context is
 * bootstrapping (checking localStorage/token validity), show a spinner
 * instead of flashing a redirect to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading message="Checking your session…" minHeight="100vh" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
