import { useContext, useEffect, useRef, useState } from 'react';
import './TopBanner.css';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import AppContext from '../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import Spinner from './Spinner';


const TopBanner = () => {
  const navi = useNavigate();
  const { updateUserContext, userContext } = useContext(AppContext);
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const bannerRef = useRef(null);

  // publish the banner's height as --banner-height so pages and the sidebar sit below the fixed banner
  useEffect(() => {
    const banner = bannerRef.current;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--banner-height', `${banner.offsetHeight}px`);
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  const signout = async () => {
    setLoggingOut(true);
    let response;
    try {
      response = await logout({ ...userContext });
    } finally {
      setLoggingOut(false);
    }
    if (response?.success == true) {
      updateUserContext({ username: '', password: '', loggedIn: false });
      localStorage.removeItem('userContext');
      queryClient.removeQueries({ queryKey: ['me'] });

      navi('/login');
    }
    return;
  };
  return (
    <div className="top-banner" ref={bannerRef}>
      <Spinner show={loggingOut} message="Logging out.." />
      <div
        id="title"
        className="banner-title"
        onClick={() => {
          navi('/');
        }}
      >
        <h1>casahero</h1>
      </div>
      <div id="auth-links" className="auth-links">
        {userContext && userContext.loggedIn ? (
          <span>Welcome, {userContext?.full_name}</span>
        ) : (
          <span>Welcome, Guest ! </span>
        )}
        {userContext?.loggedIn != true && (
          <button
            id="register-button"
            onClick={() => {
              navi('/signup');
            }}
          >
            Register
          </button>
        )}
        {userContext?.loggedIn != true && (
          <button
            id="login-button"
            onClick={() => {
              navi('/login');
            }}
          >
            Login
          </button>
        )}
        {userContext?.loggedIn && (
          <button id="logout-button" onClick={signout} disabled={loggingOut}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBanner;
