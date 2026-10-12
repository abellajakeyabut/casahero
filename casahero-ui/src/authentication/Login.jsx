import { useState, useContext, useEffect } from 'react';
import AppContext from '../context/AppContext';
import './Login.css'; // CSS file with styles
import RolePick from './RolePick';
import AuthContext from './AuthContext';
import TopBanner from '../dashboard/TopBanner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { updateUserContext, userContext } = useContext(AppContext);
  const { login } = useContext(AuthContext);
  const navi = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    let isLoggedIn = login();
    updateUserContext({ ...userContext, loggedIn: isLoggedIn });
    if (isLoggedIn) {
      navi('/dashboard');
    }
  };
  const updateUserName = (data) => {
    updateUserContext({ ...userContext, username: data });
  };
  const updatePassword = (data) => {
    updateUserContext({ ...userContext, pwd: data });
  };
  useEffect(() => {
    userContext == undefined &&
      updateUserContext({ role: 'tenant', loggedIn: false });
  }, [userContext]);
  return (
    <div className={'login-wrapper'}>
      <TopBanner userContext={userContext}></TopBanner>
      <div className="login-header">
        <h1>casahero - {userContext?.role}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          onChange={(e) => {
            updateUserName(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          onChange={(e) => {
            updatePassword(e.target.value);
          }}
        />

        <button
          type="submit"
          className={
            userContext?.role == 'landlord'
              ? 'login-button-landlord'
              : 'login-button'
          }
        >
          Log In
        </button>
      </form>

      <div className="login-footer">
        <RolePick></RolePick>
        <a href="#">Forgot Password?</a>
      </div>
    </div>
  );
};

export default Login;
