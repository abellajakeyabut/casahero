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
  const { data, isLoading, isError } = useMe();
  useEffect(() => {
    if (data) updateUserContext(data);
  }, [data]);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <Navigate to="/login" replace />;
  if (role && data.default_role !== role) {
    return <Navigate to={homeFor(data.default_role)} replace />;
  }

  return children ?? <Outlet />;
};

export default SafeRoute;
