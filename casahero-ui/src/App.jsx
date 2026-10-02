import { useEffect, useState, useContext } from 'react';
//import heroImg from './assets/hero.png'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
import './App.css';
import AppContext from './context/AppContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './authentication/Login';
import Dashboard from './dashboard/Dashboard';
import AuthProvider from './authentication/AuthProvider';
import Landing from './landing/Landing';
import UnderConstruction from './underconstruction/underconstruction';
const App = () => {
  const { userContext, updateUserContext } = useContext(AppContext);

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
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/" element={<Landing />}></Route>
        <Route path="*" element={<UnderConstruction />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
