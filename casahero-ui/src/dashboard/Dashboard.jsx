import React, { useState } from 'react';
import TopBanner from './TopBanner';
import SearchBar from './searchbar/SearchBar';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

import './Dashboard.css'; // CSS file with styles

const TopSearchBanner = ({ onSearch }) => {
  const { userContext } = useContext(AppContext);

  return (
    <div className="dashboard-container">
      <TopBanner userContext={userContext} />
      <SearchBar></SearchBar>
    </div>
  );
};

export default TopSearchBanner;
