import { useContext, useEffect, useState } from 'react';
import AppContext from '../../context/AppContext';
import './Login.css'; // CSS file with styles
import RolePick from './RolePick';
import AuthContext from './AuthContext';
import TopBanner from '../dashboard/TopBanner';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../shared/Spinner';
import SocialButtons from '../../shared/SocialButtons';
import { useQueryClient } from '@tanstack/react-query';

const Login = () => {
  const { updateUserContext, userContext } = useContext(AppContext);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { authenticate } = useContext(AuthContext);
  const [loginDetails, setLoginDetails] = useState({
    username: '',
    password: '',
  });
  const navi = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShow(true);
    try {
      // authenticate updates the user context (keeping the role) on success
      const isLoggedIn = await authenticate(loginDetails);
      if (isLoggedIn) {
        navi('/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setShow(false);
    }
  };
  const updateEmail = (data) => {
    setLoginDetails({ ...loginDetails, email: data });
  };
  const updatePassword = (data) => {
    setLoginDetails({ ...loginDetails, password: data });
  };
  // reset to logged out once on mount, keeping a role picked earlier (e.g. on the landing page)
  useEffect(() => {
    localStorage.removeItem('userContext');
    queryClient.clear();
    updateUserContext((prev) => ({
      default_role: prev?.default_role ?? 'tenant',
      loggedIn: false,
      username: '',
    }));
  }, [updateUserContext]);
  return (
    <div className={'login-wrapper'}>
      <Spinner show={show} message="Logging in.." />
      <TopBanner></TopBanner>
      <div className="login-header">
        <h1>casahero</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          className="login-input"
          onChange={(e) => {
            updateEmail(e.target.value);
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
            userContext?.default_role == 'landlord'
              ? 'login-button-landlord'
              : 'login-button'
          }
        >
          Log In
        </button>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <SocialButtons disabled={show} />

      <div className="login-footer">
        <a href="#">Forgot Password?</a>
      </div>
    </div>
  );
};

export default Login;
