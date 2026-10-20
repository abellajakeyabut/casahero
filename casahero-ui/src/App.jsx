import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/authentication/Login';
import Dashboard from './features/dashboard/Dashboard';
import AuthProvider from './features/authentication/AuthProvider';
import Landing from './features/landing/Landing';
import UnderConstruction from './underconstruction/UnderConstruction';
import SafeRoute from './SafeRoute';
import Signup from './features/signup/Signup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

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
          <Route
            path="/dashboard"
            element={
              <AuthProvider>
                <SafeRoute>
                  <Dashboard></Dashboard>
                </SafeRoute>
              </AuthProvider>
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
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<UnderConstruction />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
