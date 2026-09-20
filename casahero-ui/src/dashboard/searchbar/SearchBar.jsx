import { useState } from "react";

const SearchBar = () => {
    const [propertyType, setPropertyType] = useState("")
    const [query, setQuery] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query); // pass search term up to parent
    };
    return (
        <>
            <div className="search-container">
                <div className="property-type">
                    <label>
                        <input
                            type="radio"
                            name="propertyType"
                            value="Residential"
                            checked={propertyType === "Residential"}
                            onChange={(e) => setPropertyType(e.target.value)}
                        />
                        <span className="icon">🏠</span> Residential
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="propertyType"
                            value="Commercial"
                            checked={propertyType === "Commercial"}
                            onChange={(e) => setPropertyType(e.target.value)}
                        />

                        <span className="icon">🏢</span> Commercial
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="propertyType"
                            value="Staycation"
                            checked={propertyType === "Staycation"}
                            onChange={(e) => setPropertyType(e.target.value)}
                        />
                        <span className="icon">🌴</span> Staycation
                    </label>
                </div>
                <div>
                    <form className="search-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Select Region..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input"
                        />
                          <input
                            type="text"
                            placeholder="Select City..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
export default SearchBar;
