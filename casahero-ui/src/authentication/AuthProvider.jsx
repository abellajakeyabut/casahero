import { useContext, useState } from 'react';
import AuthContext from './AuthContext';
import AppContext from '../context/AppContext';

const AuthProvider = ({ children }) => {
  const { updateUserContext, userContext } = useContext(AppContext);

  const [tenant, setTenant] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ role: 'tenant' });

  const login = (uname, pwd) => {
    updateUserContext({
      ...userContext,
      loggedIn: true,
      username: uname,
    });

    return true;
  };
  const updateLoginDetails = (data) => {
    updateUserContext({ ...data });
  };
  return (
    <AuthContext.Provider
      value={{
        updateLoginDetails,
        login,
        loginDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
