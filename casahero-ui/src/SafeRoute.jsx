import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './authentication/AuthContext';
import AppContext from './context/AppContext';

// Example authentication check (replace with your real auth logic)
const useAuth = () => {
  //const user = localStorage.getItem("user"); // or context/state
  //return !!user;
   const { userContext } = useContext(AppContext);
  //const { loginDetails } = useContext(AuthContext);

  if (userContext == undefined) {
    return false;
  }
  return userContext.loggedIn;
};

// ProtectedRoute component
const SafeRoute = ({ children }) => {
  return useAuth() ? children : <Navigate to="/login" replace />;
};

export default SafeRoute;
