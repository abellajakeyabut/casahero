import TopBanner from '../dashboard/TopBanner';
import './Signup.css'; // CSS file with styles
import { signup } from '../api/auth';
import { useState } from 'react';
import SuccessModal from './SuccessModal';
const Signup = () => {
  const [registered, setRegistered] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    register();
  };
  const register = async () => {
    let result = await signup(formData);
    if (result.success) {
      setRegistered(true);
    }
  };
  return (
    <>
      <TopBanner />
      <div className="signup-wrapper">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="signup-row">
            <span>Name</span>
            <input
              type="text"
              placeholder="Name"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="signup-row">
            <span>Email</span>
            <input
              type="text"
              placeholder="Email"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="signup-row">
            <span>Password</span>
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="signup-row">
            <span>Confirm</span>
            <input
              type="password"
              placeholder="Confirm Password"
              required
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
          <div className="signup-row">
            <button className="signup-button" type="submit">
              Sign Up{' '}
            </button>
          </div>
        </form>
      </div>
      {registered && <SuccessModal />}
    </>
  );
};
export default Signup;
