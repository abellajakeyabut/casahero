import { useContext, useState } from 'react';
import AuthContext from './AuthContext';
import AppContext from '../context/AppContext';

const AuthProvider = ({ children }) => {
  const { updateUserContext } = useContext(AppContext);

  const [tenant, setTenant] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ role: 'tenant' });

  const login = () => {
    updateUserContext({ ...loginDetails });
    
    return true;
  };
  const updateLoginDetails = (data) => {
    setLoginDetails({ ...data });
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
