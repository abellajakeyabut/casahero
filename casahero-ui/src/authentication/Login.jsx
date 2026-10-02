import { useState, useContext } from "react";
import AppContext from "../context/AppContext";
import "./Login.css"; // CSS file with styles
import RolePick from "./RolePick"
import AuthContext from "./AuthContext"
import TopBanner from "../dashboard/TopBanner";

const Login = () => {
    const { updateUserContext, userContext } = useContext(AppContext);
    const { updateLoginDetails, login , loginDetails} = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        login();
    };
    const updateUserName = (data) => {
        updateLoginDetails({ ...loginDetails, uid: data })
    }
    const updatePassword = (data) => {
        updateLoginDetails({ ...loginDetails, pwd: data })
    }
  
    return (
        <div className="login-wrapper">
            <TopBanner></TopBanner>
            <div className="login-header">
                <h1>casahero</h1>
            </div>
        
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" className="login-input" onChange={(e) => { updateUserName(e.target.value) }} />
                <input type="password" placeholder="Password" className="login-input" onChange={(e) => { updatePassword(e.target.value) }} />

                <button type="submit" className="login-button">Log In</button>
            </form>

            <div className="login-footer">
            <RolePick></RolePick>
                <a href="#">Forgot Password?</a>
            </div>
        </div>

    );
};

export default Login;
