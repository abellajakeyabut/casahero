const LandlordHomeCards = ({ cards }) => {
    return (
        <div className="landlord-home-row">
            {cards.map((card, index) => (
                <div key={index} className="header-card">
                    <div className="header-card-title">{card}</div>
                    <div className="header-card-data">
                        <h3>0</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default LandlordHomeCards;