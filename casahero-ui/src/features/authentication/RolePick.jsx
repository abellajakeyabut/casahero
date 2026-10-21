import { useContext } from 'react';
import AppContext from '../../context/AppContext';
import './Login.css'; // CSS file with styles

const RolePick = () => {
  const { updateUserContext, userContext } = useContext(AppContext);
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
            background: userContext?.default_role === 'tenant' ? '#006d5b' : '#f0f0f0',
            color: userContext?.default_role === 'tenant' ? '#fff' : '#333',
            borderRadius: '6px 0 0 6px',
          }}
        >
          <input
            type="radio"
            name="role"
            value="tenant"
            checked={userContext?.default_role === 'tenant'}
            onChange={() =>
              updateUserContext({ ...userContext, default_role: 'tenant' })
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
              userContext?.default_role === 'landlord' ? '#006d5b' : '#f0f0f0',
            color: userContext?.default_role === 'landlord' ? '#fff' : '#333',
            borderRadius: '0 6px 6px 0',
          }}
        >
          <input
            type="radio"
            className="login-button-landlord"
            name="role"
            value="landlord"
            checked={userContext?.default_role === 'landlord'}
            onChange={() =>
              updateUserContext({ ...userContext, default_role: 'landlord' })
            }
            style={
              userContext?.default_role == 'tenant'
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
