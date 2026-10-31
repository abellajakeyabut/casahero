import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../src/features/authentication/useMe';
import Spinner from '../src/shared/Spinner';
import { useContext, useEffect } from 'react';
import AppContext from './context/AppContext';
import { homeFor } from './roles';

// ProtectedRoute component.
// With `role`, only that role gets in; anyone else is sent to their own home.
// Wraps `children`, or renders nested routes through <Outlet /> when used as a layout route.
const SafeRoute = ({ role, children }) => {
  const { updateUserContext } = useContext(AppContext);
  const { data, isLoading } = useMe();
  // only a real user object counts; a failed background refetch keeps the last good `data`
  const user = data?.loggedIn && data?.default_role ? data : null;
  useEffect(() => {
    if (user) updateUserContext(user);
  }, [user, updateUserContext]);

  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.default_role !== role) {
    return <Navigate to={homeFor(user.default_role)} replace />;
  }

  return children ?? <Outlet />;
};

export default SafeRoute;
