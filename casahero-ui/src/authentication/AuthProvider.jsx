import { useContext, useState } from 'react';
import AuthContext from './AuthContext';
import AppContext from '../context/AppContext';

const AuthProvider = ({ children }) => {
  const { updateUserContext, userContext } = useContext(AppContext);

  const login = (uname, pwd) => {
    updateUserContext({
      ...userContext,
      loggedIn: true,
      username: uname,
    });

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
