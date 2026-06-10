import './about.scss';

const About = () => {
    const stats = [
        {
            number: "1000+",
            label: "Properties Listed"
        },
        {
            number: "500+",
            label: "Happy Clients"
        },
        {
            number: "10+",
            label: "Years Experience"
        },
        {
            number: "50+",
            label: "Expert Agents"
        }
    ];

    const values = [
        {
            icon: "fas fa-handshake",
            title: "Trust",
            description: "Building lasting relationships through transparency and integrity in every transaction."
        },
        {
            icon: "fas fa-star",
            title: "Excellence",
            description: "Committed to delivering exceptional service and exceeding expectations."
        },
        {
            icon: "fas fa-users",
            title: "Community",
            description: "Creating positive impact in our communities through responsible real estate practices."
        }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="content">
                    <h1>About TGUsEstate</h1>
                    <p>Your Trusted Partner in Real Estate</p>
                </div>
            </section>

            <div className="container">
                {/* Mission Section */}
                <section className="mission">
                    <h2>Our Mission</h2>
                    <p>
                        At TGUsEstate, we are dedicated to helping our clients find properties 
                        that perfectly match their lifestyle and investment goals. With years 
                        of experience and deep market knowledge, we provide exceptional service 
                        and guidance throughout your real estate journey.
                    </p>

                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <h3>{stat.number}</h3>
                                <p>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section className="values">
                    <h2>Our Values</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <i className={value.icon}></i>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About; 