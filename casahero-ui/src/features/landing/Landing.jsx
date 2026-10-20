import TopBanner from '../dashboard/TopBanner';
import AppContext from '../../context/AppContext';
import { useContext } from 'react';
import './Landing.css'; // CSS file with styles
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    role: 'landlord',
    icon: '🏠',
    title: 'I’m a Landlord',
    tagline: 'List and manage your properties in one place.',
    perks: [
      'Track properties and tenants',
      'Collect rent online',
      'Handle maintenance requests',
    ],
    cta: 'Continue as Landlord',
  },
  {
    role: 'tenant',
    icon: '🔑',
    title: 'I’m a Tenant',
    tagline: 'Find your next home and rent without the hassle.',
    perks: [
      'Search rentals by region and city',
      'Pay rent securely online',
      'Submit maintenance requests',
    ],
    cta: 'Continue as Tenant',
  },
];

const Landing = () => {
  const { updateUserContext } = useContext(AppContext);
  const navi = useNavigate();

  // remember the picked role (Login keeps it) and move on
  const roleSelect = (role, path) => {
    updateUserContext((prev) => ({ ...prev, role }));
    navi(path);
  };

  return (
    <>
      <TopBanner />
      <main className="landing">
        <header className="landing-hero">
          <h1>Welcome to Casahero</h1>
          <p>Smarter rentals for landlords &amp; tenants. How will you use Casahero?</p>
        </header>

        <div className="landing-roles">
          {roles.map(({ role, icon, title, tagline, perks, cta }) => (
            <section key={role} className={`role-card role-card--${role}`}>
              <div className="role-card-icon" aria-hidden="true">
                {icon}
              </div>
              <h2>{title}</h2>
              <p className="role-card-tagline">{tagline}</p>
              <ul className="role-card-perks">
                {perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className="role-card-cta"
                onClick={() => roleSelect(role, '/login')}
              >
                {cta} →
              </button>
              <button
                type="button"
                className="role-card-secondary"
                onClick={() => roleSelect(role, '/signup')}
              >
                New here? Create an account
              </button>
            </section>
          ))}
        </div>
      </main>
    </>
  );
};

export default Landing;
