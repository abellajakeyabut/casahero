import { useState, useContext } from 'react';
import AppContext from '../context/AppContext';
import './Login.css'; // CSS file with styles
import RolePick from './RolePick';
import AuthContext from './AuthContext';
import TopBanner from '../dashboard/TopBanner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { updateUserContext, userContext } = useContext(AppContext);
  const { updateLoginDetails, login, loginDetails } = useContext(AuthContext);
  const navi = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    let isLoggedIn = login();
    updateLoginDetails({ ...loginDetails, loggedIn: isLoggedIn });
    if (isLoggedIn) {
      navi('/dashboard');
    }
  };
  const updateUserName = (data) => {
    updateLoginDetails({ ...loginDetails, uid: data });
  };
  const updatePassword = (data) => {
    updateLoginDetails({ ...loginDetails, pwd: data });
  };

  return (
    <div className={'login-wrapper'}>
      <TopBanner></TopBanner>
      <div className="login-header">
        <h1>casahero - {loginDetails.role}</h1>
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
            loginDetails.role == 'landlord'
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
