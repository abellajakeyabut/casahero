import React, { useState } from "react";
import "./Dashboard.css"; // CSS file with styles
import {useNavigate} from 'react-router-dom'
const TopBanner = ({ onSearch }) => {
    const navi = useNavigate();

    return (
        <div className="top-banner">

            <div className="banner-title" onClick={()=>{navi("/")}}><h1>casahero</h1></div>
     
            <div className="auth-links">
               
                <button>Register</button>
                <button onClick={()=>{navi("/login")}}>Login</button>
            </div>

        </div>
    );
};

export default TopBanner;
