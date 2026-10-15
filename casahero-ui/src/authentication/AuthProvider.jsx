import { useContext, useState } from 'react';
import AuthContext from './AuthContext';
import AppContext from '../context/AppContext';
import { login } from '../api/auth';
const AuthProvider = ({ children }) => {
  const { updateUserContext, userContext } = useContext(AppContext);

  const authenticate = async (payload) => {
    let response = await login(payload);
    if (!response || !response.success) {
      return false;
    }

    updateUserContext({
      ...userContext,
      loggedIn: true,
      username: payload.username,
    });

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        authenticate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
