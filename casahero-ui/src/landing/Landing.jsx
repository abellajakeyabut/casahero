import TopBanner from '../dashboard/TopBanner';
import AppContext from '../context/AppContext';
import { useContext } from 'react';
import '../landing/Landing.css'; // CSS file with styles
import { useNavigate } from 'react-router-dom';
import AuthContext from '../authentication/AuthContext';

const Landing = () => {
  const { user, updateUserContext } = useContext(AppContext);
  const { updateLoginDetails } = useContext(AuthContext);
  const navi = useNavigate();
  const landlord = (role) => {
    updateLoginDetails({ ...user, role: role });
    navi('/login');
  };
  const tenant = (role) => {
    updateLoginDetails({ ...user, role: role });
    navi('/login');
  };
  return (
    <>
      <TopBanner />
      <div className="landing-container">
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-500 text-white py-20 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Casahero</h1>
            <p className="text-lg mb-12">
              Smarter Rentals for Landlords & Tenants
            </p>

            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
              {/* Landlord Card */}
              <button onClick={() => landlord('landlord')}>
                <div className="text-5xl mb-4">🏠</div>
                <h2 className="text-2xl font-semibold mb-2">I’m a Landlord</h2>
                <p className="mb-2">
                  Manage properties, tenants, and rent collection with ease.
                </p>
              </button>

              {/* Splitter */}
              <div className="hidden md:flex items-center">
                <div className="w-px h-full bg-gray-300"></div>
              </div>
              <div className="block md:hidden w-64 h-px bg-gray-300 mx-auto"></div>

              {/* Tenant Card */}
              <button onClick={() => tenant('tenant')}>
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-semibold mb-2">I’m a Tenant</h2>
                <p className="mb-2">
                  Find rentals, pay rent online, and submit maintenance
                  requests.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
