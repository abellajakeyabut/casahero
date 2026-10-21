import { useCallback, useEffect, useState } from 'react';
import AppContext from './AppContext';

const AppProvider = ({ children }) => {
  const [userContext, setUserContext] = useState(null);

  // accepts a new value or an updater function (prev => next), like setState.
  // useCallback keeps it stable so it is safe to list as an effect dependency.
  const updateUserContext = useCallback((data) => {
    setUserContext(data);
  }, []);

  // switch the color theme (see index.css) while a landlord is logged in
  const isLandlord = userContext?.loggedIn && userContext?.default_role === 'landlord';
  useEffect(() => {
    document.documentElement.dataset.role = isLandlord ? 'landlord' : 'tenant';
  }, [isLandlord]);

  return (
    <AppContext.Provider
      value={{
        updateUserContext,
        userContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;
