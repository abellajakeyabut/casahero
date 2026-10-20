import TopBanner from '../dashboard/TopBanner';
import './Signup.css'; // CSS file with styles
import { signup } from '../../api/auth';
import { useState } from 'react';
import SuccessModal from './SuccessModal';
import Spinner from '../../shared/Spinner';
import SocialButtons from '../../shared/SocialButtons';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirm,
  validateForm,
} from '../../shared/validators';
const Signup = () => {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateForm(formData, rules);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    register();
  };
  const register = async () => {
    let result = await signup(formData);
    setLoading(false);
    if (result.success) {
      setRegistered(true);
      setLoading(true);
    }
  };
  const rules = {
    name: validateName,
    email: validateEmail,
    password: validatePassword,
    confirmPassword: (value, values) => validateConfirm(values.password, value),
  };
  const validateField = (field) => {
    const message = rules[field](formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };
  const messages = Object.keys(rules)
    .map((field) => errors[field])
    .filter(Boolean);
  return (
    <>
      <Spinner show={loading} message="Creating your account..." />
      <TopBanner />
      <div className="signup-wrapper">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="signup-row">
            <span>Name</span>
            <input
              type="text"
              placeholder="Name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onBlur={() => validateField('name')}
              aria-invalid={!!errors.name}
            />
          </div>
          <div className="signup-row">
            <span>Email</span>
            <input
              type="text"
              placeholder="Email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onBlur={() => validateField('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          <div className="signup-row">
            <span>Password</span>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onBlur={() => validateField('password')}
              aria-invalid={!!errors.password}
            />
          </div>
          <div className="signup-row">
            <span>Confirm</span>
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              onBlur={() => validateField('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
          </div>
          <div className="signup-row">
            <button className="signup-button" type="submit">
              Sign Up{' '}
            </button>
          </div>
          {messages.length > 0 && (
            <ul className="signup-errors" role="alert">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </form>
        <SocialButtons disabled={loading} />
      </div>
      {registered && <SuccessModal />}
    </>
  );
};
export default Signup;
