import { useContext } from 'react';
import './Dashboard.css'; // CSS file with styles
import { useNavigate } from 'react-router-dom';
import {logout} from '../../api/auth'
import AppContext from '../../context/AppContext';
const TopBanner = () => {
  const navi = useNavigate();
  const { updateUserContext, userContext } = useContext(AppContext);

  const signout=async()=>{
    let response = await logout({...userContext});
    if(response.success == true){
      updateUserContext({username:"",password:"",loggedIn:false})
      navi('/login')
    }
    return;
  }
  return (
    <div className="top-banner">
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
          <span>Welcome, {userContext?.username}</span>
        ) : (
          <span>Welcome, Guest ! </span>
        )}
        {
          userContext?.loggedIn != true && <button
            id="register-button"
            onClick={() => {
              navi('/signup');
            }}
          >
            Register
          </button>

        }
        {
          userContext?.loggedIn != true && <button
            id="login-button"
            onClick={() => {
              navi('/login');
            }}
          >
            Login
          </button>
        }
        {
          userContext?.loggedIn && <button id="logout-button"  onClick={signout}>Log out</button>
        }
      </div>
    </div>
  );
};

export default TopBanner;
