import React from 'react';
import TopBanner from '../dashboard/TopBanner';
import '../underconstruction/underconstruction.css'; // CSS file with styles

const UnderConstruction = () => {
  return (
    <>
      <TopBanner />
      <div className="landing-container">
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-500 text-white py-20 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Casahero</h1>
            <p className="text-lg mb-12"></p>

            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
              {/* Landlord Card */}
              This section is currently being built. Please check back soon! 🚧
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UnderConstruction;
