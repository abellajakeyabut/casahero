import React, { useState } from "react";
import TopBanner from "./TopBanner";
import SearchBar from "./searchbar/SearchBar";
import "./Dashboard.css"; // CSS file with styles
const TopSearchBanner = ({ onSearch }) => {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
       <div className="dashboard-container">
                <TopBanner/>
                <SearchBar></SearchBar>
              
               

              
            </div>
    );
};

export default TopSearchBanner;
