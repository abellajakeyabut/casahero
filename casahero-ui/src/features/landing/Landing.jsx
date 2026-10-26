import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import TopBanner from "../../shared/TopBanner";
import SearchBar from "../search/SearchBar";
import { toSearchUrl } from "../search/searchParams";
import "./Landing.css";

const Landing = () => {
    const navigate = useNavigate();
    const { userContext } = useContext(AppContext);

    return (
        <>
            <TopBanner/>
            <SearchBar onSearch={(filters) => navigate(toSearchUrl(filters))}/>
            {/* guests only: Signup reads ?role=landlord to preselect the landlord role */}
            {!userContext?.loggedIn && (
                <aside className="landlord-cta">
                    <div>
                        <h2>Own a property?</h2>
                        <p>List it on casahero and find tenants faster.</p>
                    </div>
                    <Link className="landlord-cta-link" to="/signup?role=landlord">
                        Sign up as a landlord
                    </Link>
                </aside>
            )}
        </>
    )
}

export default Landing;
