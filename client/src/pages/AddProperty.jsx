import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePropertyStore from '../store/usePropertyStore';
import useAuthStore from '../store/useAuthStore';
import MapSelector from '../components/MapSelector';
import './AddProperty.scss';

function AddProperty() {
    const navigate = useNavigate();
    const { createProperty, loading, error, clearError, userProperties } = usePropertyStore();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'house',
        status: 'for-sale',
        price: '',
        address: '',
        city: '',
        state: '',
        lat: '',
        lng: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        images: []
    });
    
    const [imagePreview, setImagePreview] = useState([]);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState(false);
    
    // Check property limit
    const propertyLimit = user?.role === 'user' ? 5 : Infinity;
    const currentPropertyCount = userProperties.length;
    const canAddMore = currentPropertyCount < propertyLimit;
    
    useEffect(() => {
        if (!canAddMore && user?.role === 'user') {
            setFormError(`You have reached the maximum limit of ${propertyLimit} properties. Please upgrade to agent role for unlimited properties.`);
        }
    }, [canAddMore, user?.role, propertyLimit]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            images: files
        });
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreview(previews);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        clearError();
        
        // Basic validation
        if (!formData.title || !formData.price || !formData.city) {
            setFormError('Please fill in all required fields (Title, Price, City)');
            return;
        }
        
        try {
            await createProperty(formData);
            setSuccess(true);
            
            // Redirect to profile page after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setFormError(err.message || 'Failed to create property');
        }
    };
    
    const removeImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        
        const newPreviews = [...imagePreview];
        URL.revokeObjectURL(newPreviews[index]); // Free up memory
        newPreviews.splice(index, 1);
        
        setFormData({
            ...formData,
            images: newImages
        });
        setImagePreview(newPreviews);
    };
    
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    
    const handleLocationSelect = (location) => {
        setFormData(prev => ({
            ...prev,
            lat: location.lat.toString(),
            lng: location.lng.toString()
        }));
    };
    
    return (
        <div className="add-property-container">
            <div className="add-property-header">
                <h1>Add New Property</h1>
                <button 
                    className="back-button"
                    onClick={() => navigate('/profile')}
                >
                    Back to Profile
                </button>
            </div>
            
            {user?.role === 'user' && (
                <div className="property-limit-info">
                    <p>Properties: {currentPropertyCount}/{propertyLimit}</p>
                    {!canAddMore && (
                        <p className="limit-warning">
                            You have reached the maximum limit. Please upgrade to agent role for unlimited properties.
                        </p>
                    )}
                </div>
            )}
            
            {success ? (
                <div className="success-message">
                    <h2>Property Created Successfully!</h2>
                    <p>Redirecting to your profile...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="property-form">
                    {(formError || error) && (
                        <div className="error-message">
                            {formError || error}
                        </div>
                    )}
                    
                    <div className="form-section">
                        <h2>Basic Information</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="title">Title*</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Property Title"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your property"
                                    rows="4"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row two-columns">
                            <div className="form-group">
                                <label htmlFor="type">Property Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="status">Listing Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="for-sale">For Sale</option>
                                    <option value="for-rent">For Rent</option>
                                    <option value="sold">Sold</option>
                                    <option value="rented">Rented</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price* (₹)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Property Price"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Location</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="address">Street Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123 Main St"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row two-columns">
                            <div className="form-group">
                                <label htmlFor="city">City*</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="state">State/Province</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Select Location on Map</label>
                                <MapSelector
                                    initialPosition={formData.lat && formData.lng ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : null}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </div>
                        </div>
                        
                        <div className="form-row two-columns">
                            <div className="form-group">
                                <label htmlFor="lat">Latitude</label>
                                <input
                                    type="text"
                                    id="lat"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    placeholder="Latitude (optional)"
                                    readOnly
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lng">Longitude</label>
                                <input
                                    type="text"
                                    id="lng"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    placeholder="Longitude (optional)"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Property Details</h2>
                        <div className="form-row three-columns">
                            <div className="form-group">
                                <label htmlFor="bedrooms">Bedrooms</label>
                                <input
                                    type="number"
                                    id="bedrooms"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    placeholder="Number of bedrooms"
                                    min="0"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="bathrooms">Bathrooms</label>
                                <input
                                    type="number"
                                    id="bathrooms"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    placeholder="Number of bathrooms"
                                    min="0"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="area">Area (sq ft)</label>
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    placeholder="Property area"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h2>Images</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="images">Upload Images</label>
                                <input
                                    type="file"
                                    id="images"
                                    name="images"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    multiple
                                    className="file-input"
                                    ref={fileInputRef}
                                />
                                <div 
                                    className="file-input-label"
                                    onClick={triggerFileInput}
                                >
                                    Choose Files
                                </div>
                            </div>
                        </div>
                        
                        {imagePreview.length > 0 && (
                            <div className="image-preview-container">
                                {imagePreview.map((src, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={src} alt={`Preview ${index}`} />
                                        <button 
                                            type="button" 
                                            className="remove-image"
                                            onClick={() => removeImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => navigate('/profile')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Property'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default AddProperty; 