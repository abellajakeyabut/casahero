import TopBanner from '../dashboard/TopBanner';
import './Signup.css'; // CSS file with styles
const Signup = () => {
  return (
    <>
      <TopBanner />
      <div className="signup-wrapper">
        <h2>Sign Up</h2>
        <form>
          <div className="signup-row">
            <span>Name</span>
            <input type="text" placeholder="Name" />
          </div>
          <div className="signup-row">
            <span>Email</span>
            <input type="text" placeholder="Email" />
          </div>
          <div className="signup-row">
            <span>Password</span>
            <input type="password" placeholder="Password" />
          </div>
          <div className="signup-row">
            <span>Confirm</span>
            <input type="password" placeholder="Confirm Password" />
          </div>
          <div className="signup-row">
            <button className="signup-button">Sign Up </button>
          </div>
        </form>
      </div>
    </>
  );
};
export default Signup;
