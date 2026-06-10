import PropertySlider from "../../components/slider/slider";
import './SinglePage.scss'
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePropertyStore from '../../store/usePropertyStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useAuthStore from "../../store/useAuthStore";
import { validateEmail } from '../../utils/validation';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function SinglePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPropertyById, currentProperty, loading, error, clearCurrentProperty, contactPropertyOwner } = usePropertyStore();
  const { user } = useAuthStore();
  const [showContact, setShowContact] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    // Fetch property data when component mounts
    getPropertyById(id);

    // Clear property data when component unmounts
    return () => clearCurrentProperty();
  }, [id, getPropertyById, clearCurrentProperty]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(contactForm.email)) {
      alert('Please enter a valid email address');
      return;
    }
    try {
      await contactPropertyOwner(id, contactForm);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setShowContact(false);
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Property</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/list')}>Back to Listings</button>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="error-container">
        <h2>Property Not Found</h2>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/list')}>Back to Listings</button>
      </div>
    );
  }

  // Extract property data
  const {
    title,
    description,
    price,
    type,
    status,
    location,
    features,
    images,
    owner
  } = currentProperty;

  // Format images for the slider component
  const formattedImages = images.map(img => img.url);

  // Extract owner data
  const isOwner = user && owner && user._id === owner._id;

  return (
    <div className="single-page">
      <div className="left-container">
        <div className="details">
          <div className="wrapper">
            <div className="slider-container">
              {formattedImages.length > 0 ? (
                <PropertySlider
                  images={formattedImages}
                  onFullscreenChange={setIsFullscreen}
                />
              ) : (
                <div className="no-images">No images available</div>
              )}
            </div>
            <div className="info">
              <div className="top">
                <div className="post">
                  <div className="title-section">
                    <h1>{title}</h1>
                    <div className="price">
                      <span className="amount">₹{price.toLocaleString('en-IN')}</span>
                      {status === 'for-rent' && <span className="period">/month</span>}
                    </div>
                  </div>
                  <div className="address">
                    <img src="/pin.png" alt="Location" />
                    <span>{location.address}, {location.city}, {location.state}</span>
                  </div>
                  <div className="quick-info">
                    {features.bedrooms && (
                      <div className="info-item">
                        <img src="/bed.png" alt="Bedrooms" />
                        <span>{features.bedrooms} Beds</span>
                      </div>
                    )}
                    {features.bathrooms && (
                      <div className="info-item">
                        <img src="/bath.png" alt="Bathrooms" />
                        <span>{features.bathrooms} Baths</span>
                      </div>
                    )}
                    {features.area && (
                      <div className="info-item">
                        <img src="/size.png" alt="Area" />
                        <span>{features.area} sqft</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="user-card">
                  <img
                    src={owner.avatar || "/default-avatar.png"}
                    alt={owner.username}
                    onError={(e) => { e.target.src = "/default-avatar.png" }}
                  />
                  <div className="user-info">
                    <h3>{owner.username}</h3>
                    <span className="role">{owner.role}</span>
                  </div> 

                  {!isOwner && (
                    <div className="contact-popup-container">
                      <button 
                        className="contact-button"
                        onClick={() => setShowContact(!showContact)}
                      >
                        {showContact ? 'Close Contact Form' : 'Contact'}
                      </button>
                      {showContact && (
                        <div className="contact-popup">
                          <h3>Contact Property Owner</h3>
                          <form className="contact-form" onSubmit={handleContactSubmit}>
                            <div className="form-group">
                              <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={contactForm.name}
                                onChange={handleContactChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={contactForm.email}
                                onChange={handleContactChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="tel"
                                name="phone"
                                placeholder="Your Phone Number"
                                value={contactForm.phone}
                                onChange={handleContactChange}
                              />
                            </div>
                            <div className="form-group">
                              <textarea
                                name="message"
                                placeholder="Your Message"
                                value={contactForm.message}
                                onChange={handleContactChange}
                                required
                              />
                            </div>
                            <button type="submit" className="submit-button">
                              Send Message
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="property-details">
                <h2>Description</h2>
                <p>{description}</p>

                <h2>Property Details</h2>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Property Type:</span>
                    <span className="value">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">{status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  </div>
                  {features.parking !== undefined && (
                    <div className="detail-item">
                      <span className="label">Parking:</span>
                      <span className="value">{features.parking} {features.parking === 1 ? 'Space' : 'Spaces'}</span>
                    </div>
                  )}
                  {features.area && (
                    <div className="detail-item">
                      <span className="label">Area:</span>
                      <span className="value">{features.area} sqft</span>
                    </div>
                  )}
                </div>

                {location.coordinates && location.coordinates.lat && location.coordinates.lng && (
                  <div className="map-container">
                    <h2>Location</h2>
                    <MapContainer
                      center={[location.coordinates.lat, location.coordinates.lng]}
                      zoom={13}
                      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
                        <Popup>
                          {title} <br /> {location.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;