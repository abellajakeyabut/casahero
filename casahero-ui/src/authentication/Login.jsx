import { useContext, useEffect,useState } from 'react';
import AppContext from '../context/AppContext';
import './Login.css'; // CSS file with styles
import RolePick from './RolePick';
import AuthContext from './AuthContext';
import TopBanner from '../dashboard/TopBanner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { updateUserContext, userContext } = useContext(AppContext);
  const { authenticate } = useContext(AuthContext);
  const [loginDetails, setLoginDetails] = useState({ username: '', password: '' });
  const navi = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateUserContext({ role: 'tenant', loggedIn: false,username: '', password: '' });
    let isLoggedIn = await authenticate({
      username: userContext.username,
      password: userContext.password,
    });

    if (isLoggedIn) {
      updateUserContext({ ...userContext, loggedIn: isLoggedIn ,...loginDetails });
      navi('/dashboard');
    }
  };
  const updateUserName = (data) => {
    setLoginDetails({ ...loginDetails, username: data });
  };
  const updatePassword = (data) => {
    setLoginDetails({ ...loginDetails, password: data });
  };
  useEffect(() => {
    updateUserContext({ role: 'tenant', loggedIn: false,username: '', password: '' });
  }, userContext);
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
