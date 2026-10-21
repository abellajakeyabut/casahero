import { useContext } from 'react';
import AuthContext from './AuthContext';
import AppContext from '../../context/AppContext';
import { login } from '../../api/auth';
const AuthProvider = ({ children }) => {
  const { updateUserContext, userContext } = useContext(AppContext);

  const authenticate = async (payload) => {
    let response = await login(payload);
    if (!response || !response.success) {
      return false;
    }
    let cachedData = { ...userContext, ...response.user, loggedIn: true };
    // build on the latest state so the chosen role is kept
    updateUserContext(cachedData);
    localStorage.setItem('userContext', JSON.stringify(cachedData));

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
