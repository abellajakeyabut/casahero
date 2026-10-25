import { useNavigate } from "react-router-dom";
import TopBanner from "../../shared/TopBanner";
import SearchBar from "../search/SearchBar";
import { toSearchUrl } from "../search/searchParams";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <>
            <TopBanner/>
            <SearchBar onSearch={(filters) => navigate(toSearchUrl(filters))}/>
        </>
    )
}

export default Landing;
