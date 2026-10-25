import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/authentication/Login';
import Listings from './features/listings/Listings';
import AuthProvider from './features/authentication/AuthProvider';
import Landing from './features/landing/Landing'
import SearchResultsPage from './features/search/SearchResultsPage';
import UnderConstruction from './underconstruction/UnderConstruction';
import SafeRoute from './SafeRoute';
import Signup from './features/signup/Signup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMe } from './features/authentication/useMe';
import { ROLES, homeFor } from './roles';
import Dashboard from './features/dashboard/Dashboard'
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime:30_000,
      retry:1
    }
  }
});

// only rendered inside SafeRoute, so `me` is already loaded
const RoleHome = () => {
  const { data } = useMe();
  return <Navigate to={homeFor(data?.default_role)} replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthProvider>
                <Login />
              </AuthProvider>
            }
          ></Route>
          {/* one guarded route group per role: /landlord/*, /tenant/* */}
          {ROLES.map((role) => (
            <Route key={role} path={`/${role}`} element={<SafeRoute role={role} />}>
              <Route index element={<Dashboard />} />
              <Route path="*" element={<UnderConstruction />} />
            </Route>
          ))}
          {/* where Login lands: send logged-in users to their role's home */}
          <Route
            path="/listings"
            element={
              <SafeRoute>
                <RoleHome />
              </SafeRoute>
            }
          ></Route>

          <Route
            path="/"
            element={
              <AuthProvider>
                <Landing></Landing>
              </AuthProvider>
            }
          ></Route>
          {/* public: guests and logged-in users both land here after a search */}
          <Route
            path="/search"
            element={
              <AuthProvider>
                <SearchResultsPage />
              </AuthProvider>
            }
          ></Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<UnderConstruction />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
