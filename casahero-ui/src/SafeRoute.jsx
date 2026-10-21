import { Navigate } from 'react-router-dom';
import { useMe } from '../src/features/authentication/useMe';
import Spinner from '../src/shared/Spinner';
import { useContext, useEffect } from 'react';
import AppContext from './context/AppContext';

// ProtectedRoute component
const SafeRoute = ({ children }) => {
  const { updateUserContext } = useContext(AppContext);
  const { data, isLoading, isError } = useMe();
  useEffect(() => {
    if (data) updateUserContext(data);
  }, [data]);
  
  if (isLoading) return <Spinner />;
  if (isError || !data) return <Navigate to="/login" replace />;

  return children;
};

export default SafeRoute;
