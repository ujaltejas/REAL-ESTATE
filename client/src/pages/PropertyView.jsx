import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePropertyStore from '../store/usePropertyStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useAuthStore from "../store/useAuthStore";
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axios';
import './PropertyView.scss';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function PropertyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPropertyById, currentProperty, loading, error, clearCurrentProperty } = usePropertyStore();
  const { user } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Hello, I am interested in this property...'
  });

  useEffect(() => {
    getPropertyById(id);
    return () => clearCurrentProperty();
  }, [id, getPropertyById, clearCurrentProperty]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post(`/post/${id}/contact`, contactForm);

      if (response.data.success) {
        toast.success('Message sent successfully!');
        setShowContactForm(false);
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: 'Hello, I am interested in this property...'
        });
      } else {
        toast.error(response.data.message || 'Failed to send message');
        console.error('Error response:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const handleBackToProfile = () => {
    navigate('/profile');
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
        <button onClick={handleBackToProfile}>Back to Profile</button>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="error-container">
        <h2>Property Not Found</h2>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBackToProfile}>Back to Profile</button>
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
    owner,
    createdAt,
    updatedAt
  } = currentProperty;

  // Format images for the slider component
  const formattedImages = images.map(img => img.url);

  // Format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isOwner = user && owner && user._id === owner._id;

  return (
    <div className="property-view">
      <div className="property-view-header">
        <button className="back-button" onClick={handleBackToProfile}>
          Back to Profile
        </button>
        <h1>Property Details</h1>
      </div>

      <div className="property-view-content">
        <div className="slider-container">
          {formattedImages.length > 0 ? (
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={3000}
              arrows={true}
              className="property-slider"
            >
              {formattedImages.map((image, index) => (
                <div key={index} className="slider-image-container">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="slider-image"
                    style={{ width: '100%', height: '500px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="no-images">No images available</div>
          )}
        </div>

        <div className="property-info">
          <div className="property-header">
            <div className="title-section">
              <h2>{title}</h2>
              <div className="price">
                <span className="amount">${price.toLocaleString()}</span>
                {status === 'for-rent' && <span className="period">/month</span>}
              </div>
            </div>
            <div className="address">
              <img src="/pin.png" alt="Location" />
              <span>{location.address}, {location.city}, {location.state}</span>
            </div>
            <div className="status-badge" data-status={status}>
              {status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
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
            {features.parking !== undefined && (
              <div className="info-item">
                <img src="/utility.png" alt="Parking" />
                <span>{features.parking} Parking</span>
              </div>
            )}
          </div>

          <div className="property-section">
            <h3>Description</h3>
            <p>{description}</p>
          </div>

          <div className="property-section">
            <h3>Property Details</h3>
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
              <div className="detail-item">
                <span className="label">Listed On:</span>
                <span className="value">{formatDate(createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Last Updated:</span>
                <span className="value">{formatDate(updatedAt)}</span>
              </div>
            </div>
          </div>

          {location.coordinates && location.coordinates.lat && location.coordinates.lng && (
            <div className="property-section">
              <h3>Location</h3>
              <MapContainer
                center={[location.coordinates.lat, location.coordinates.lng]}
                zoom={13}
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
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

          {/* Contact Form Section - Only show for non-owners */}
          

          {/* Property Actions - Only show for owners */}
          {isOwner && (
            <div className="property-actions">
              <button
                className="edit-button"
                onClick={() => navigate(`/edit-property/${id}`)}
              >
                Edit Property
              </button>
              <button
                className="back-button"
                onClick={handleBackToProfile}
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyView; 