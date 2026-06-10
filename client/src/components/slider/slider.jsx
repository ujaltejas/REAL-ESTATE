import './slider.scss'
import { useState, useEffect } from "react";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PropertySlider({ images, onFullscreenChange }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        onFullscreenChange?.(isFullscreen);
    }, [isFullscreen, onFullscreenChange]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        className: "property-slider"
    };

    const fullscreenSettings = {
        ...settings,
        autoplay: false,
        className: "fullscreen-slider"
    };

    return (
        <div className="slider">
            {isFullscreen && (
                <div className="fullscreen-container">
                    <Slider {...fullscreenSettings}>
                        {images.map((image, index) => (
                            <div key={index} className="slide">
                                <img src={image} alt={`Property ${index + 1}`} />
                            </div>
                        ))}
                    </Slider>
                    <button className="close-button" onClick={() => setIsFullscreen(false)}>×</button>
                </div>
            )}
            
            <div className="regular-slider" onClick={() => setIsFullscreen(true)}>
                <Slider {...settings}>
                    {images.map((image, index) => (
                        <div key={index} className="slide">
                            <img src={image} alt={`Property ${index + 1}`} />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default PropertySlider;
