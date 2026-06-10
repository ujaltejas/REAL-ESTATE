
import './homePage.scss'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function HomePage() {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    return (
        <div className="homePage">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Visit TGUsEstate & Start to Explore Your New Dream Home</h1>
                    <p>Welcome to TGUsEstate , the ultimate destination for buying, selling, and renting properties. Whether you're searching for a cozy apartment, a luxurious villa, or a commercial space, we provide a seamless experience with verified listings, detailed insights, and expert guidance.</p>    
                </div>
                <div className="hero-image">
                    <img src="/pg.png" alt="Modern home" />
                </div>
            </section>
        </div>
    );
}

export default HomePage