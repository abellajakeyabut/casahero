
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './authentication/Login';
import Dashboard from './dashboard/Dashboard';
import AuthProvider from './authentication/AuthProvider';
import Landing from './landing/Landing';
import UnderConstruction from './underconstruction/underconstruction';
import SafeRoute from './SafeRoute';
import Signup from './signup/Signup';
const App = () => {
  return (
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
  );
};

export default App;
