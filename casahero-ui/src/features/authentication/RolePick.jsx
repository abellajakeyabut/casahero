import { useContext } from 'react';
import AppContext from '../../context/AppContext';
import './Login.css'; // CSS file with styles

// controlled when value/onChange are passed (Signup), otherwise reads and writes the user context (Login)
const RolePick = ({ value, onChange } = {}) => {
  const { updateUserContext, userContext } = useContext(AppContext);
  const role = value ?? userContext?.default_role;
  const pick =
    onChange ?? ((next) => updateUserContext({ ...userContext, default_role: next }));
  return (
    <>
      {/* Toggle styled radio buttons */}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <label
          style={{
            flex: 1,
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            background: role === 'tenant' ? 'var(--theme)' : '#f0f0f0',
            color: role === 'tenant' ? '#fff' : '#333',
            borderRadius: '6px 0 0 6px',
          }}
        >
          <input
            type="radio"
            name="role"
            value="tenant"
            checked={role === 'tenant'}
            onChange={() =>
              pick('tenant')
            }
            style={{ display: 'none' }}
          />
          Tenant
        </label>
        <label
          style={{
            flex: 1,
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            background:
              role === 'landlord' ? 'var(--theme)' : '#f0f0f0',
            color: role === 'landlord' ? '#fff' : '#333',
            borderRadius: '0 6px 6px 0',
          }}
        >
          <input
            type="radio"
            className="login-button-landlord"
            name="role"
            value="landlord"
            checked={role === 'landlord'}
            onChange={() =>
              pick('landlord')
            }
            style={
              role === 'tenant'
                ? { display: 'none', backgroundColor: '#006d5b' }
                : { display: 'none', backgroundColor: '#f86bad' }
            }
          />
          Landlord
        </label>
      </div>
    </>
  );
};
export default RolePick;
