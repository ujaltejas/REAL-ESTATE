import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import usePropertyStore from '../../store/usePropertyStore';
import './profile.scss';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/validation';

function Profile() {
    const { user, logout, updateProfile } = useAuthStore();
    const { userProperties, getUserProperties, loading: propertyLoading, error: propertyError } = usePropertyStore();
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [imagePreview, setImagePreview] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Fetch user properties when the component mounts or when the user changes
    useEffect(() => {
        if (user && activeTab === 'listings') {
            const fetchProperties = async () => {
                try {
                    await getUserProperties();
                } catch (err) {
                    console.error("Failed to fetch properties:", err);
                    // Error is already set in the store
                }
            };

            fetchProperties();
        }
    }, [user, activeTab, getUserProperties]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear email error when user starts typing again
        if (name === 'email') {
            setEmailError('');
        }
    };

    // Validate email when user finishes typing
    const handleEmailBlur = () => {
        if (formData.email && !validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
        } else {
            setEmailError('');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file
            });

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }

            const result = await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleAddProperty = () => {
        navigate('/add-property');
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="not-authenticated">
                    <h2>Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-info">
                    <div className="profile-avatar" onClick={isEditing ? triggerFileInput : null} style={isEditing ? { cursor: 'pointer' } : {}}>
                        {isEditing && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        )}
                        {imagePreview ? (
                            <div className="avatar-wrapper">
                                <img src={imagePreview} alt="Profile" />
                                {isEditing && <div className="avatar-overlay">Change</div>}
                            </div>
                        ) : (
                            <div className="avatar-placeholder">
                                {user.username ? user.username[0].toUpperCase() : 'U'}
                                {isEditing && <div className="avatar-overlay">Add</div>}
                            </div>
                        )}
                    </div>
                    <div className="profile-details">
                        <h1>{user.username || 'User'}</h1>
                        <p>{user.email}</p>
                    </div>
                    <button
                        className="logout-button"
                        onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <button
                        className={activeTab === 'info' ? 'active' : ''}
                        onClick={() => setActiveTab('info')}
                    >
                        Personal Info
                    </button>
                    <button
                        className={activeTab === 'listings' ? 'active' : ''}
                        onClick={() => setActiveTab('listings')}
                    >
                        My Listings
                    </button>
                    {/* <button
                        className={activeTab === 'favorites' ? 'active' : ''}
                        onClick={() => setActiveTab('favorites')}
                    >
                        Favorites
                    </button> */}
                </div>

                <div className="tab-content">
                    {activeTab === 'info' && (
                        <div className="personal-info">
                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="edit-profile-form">
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleEmailBlur}
                                            required
                                            className={emailError ? 'error-input' : ''}
                                        />
                                        {emailError && <div className="input-error">{emailError}</div>}
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    username: user.username || '',
                                                    email: user.email || ''
                                                });
                                                setImagePreview(user.avatar || '');
                                                setError('');
                                                setSuccess('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="save-button"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="info-card">
                                        <div className="card-header">
                                            <h3>Contact Information</h3>
                                            <button
                                                className="edit-button"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Username:</span>
                                            <span className="value">{user.username}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Email:</span>
                                            <span className="value">{user.email}</span>
                                        </div>

                                    </div>

                                    <div className="info-card">
                                        <h3>Account Information</h3>
                                        <div className="info-item">
                                            <span className="label">Member Since:</span>
                                            <span className="value">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Account Type:</span>
                                            <span className="value">{user.role || 'Regular User'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'listings' && (
                        <div className="listings">
                            <div className="listings-header">
                                <h3>Your Property Listings</h3>
                                <button
                                    className="add-property-button"
                                    onClick={handleAddProperty}
                                >
                                    Add Property
                                </button>
                            </div>
                            <div className="listings-grid">
                                {propertyLoading ? (
                                    <div className="loading-state">Loading your properties...</div>
                                ) : propertyError ? (
                                    <div className="error-state">
                                        <p>Error loading properties: {propertyError}</p>
                                        <button
                                            className="retry-button"
                                            onClick={() => getUserProperties()}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : userProperties && userProperties.length > 0 ? (
                                    userProperties.map(property => (
                                        <div key={property._id} className="property-card">
                                            <div className="property-image">
                                                {property.images && property.images.length > 0 ? (
                                                    <img src={property.images[0].url || property.images[0]} alt={property.title} />
                                                ) : (
                                                    <div className="no-image">No Image</div>
                                                )}
                                            </div>
                                            <div className="property-details">
                                                <h4>{property.title}</h4>
                                                <p className="property-price">₹{property.price?.toLocaleString('en-IN') || 'N/A'}</p>
                                                <p className="property-location">
                                                    {property.location?.city || property.city || 'N/A'},
                                                    {property.location?.state || property.state || ''}
                                                </p>
                                                <div className="property-features">
                                                    <span>{property.features?.bedrooms || property.bedrooms || 0} beds</span>
                                                    <span>{property.features?.bathrooms || property.bathrooms || 0} baths</span>
                                                    <span>{property.features?.area || property.area || 0} sqft</span>
                                                </div>
                                                <div className="property-actions">
                                                    <button
                                                        className="edit-property-button"
                                                        onClick={() => navigate(`/edit-property/${property._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="view-property-button"
                                                        onClick={() => navigate(`/my-property/${property._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        No listings yet. Click "Add Property" to create your first listing!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="favorites">
                            <h3>Saved Properties</h3>
                            <div className="favorites-grid">
                                {/* Favorites will be mapped here */}
                                <div className="empty-state">
                                    No Saved properties yet
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile; 