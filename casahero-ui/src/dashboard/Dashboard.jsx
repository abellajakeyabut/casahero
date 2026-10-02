import React, { useState } from "react";
import TopBanner from "./TopBanner";
import SearchBar from "./searchbar/SearchBar";
import "./Dashboard.css"; // CSS file with styles
const TopSearchBanner = ({ onSearch }) => {
  return (
       <div className="dashboard-container">
                <TopBanner/>
                <SearchBar></SearchBar>
           </div>
    );
};

export default TopSearchBanner;
