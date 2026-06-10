import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePropertyStore from '../store/usePropertyStore';
import MapSelector from '../components/MapSelector';
import './AddProperty.scss'; // We can reuse the same styles

function EditProperty() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateProperty, getUserProperties, loading, error, clearError, userProperties } = usePropertyStore();
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
    });
    
    // Separate states for existing and new images
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load existing property data
    useEffect(() => {
        const property = userProperties.find(p => p._id === id);
        if (property) {
            setFormData({
                title: property.title || '',
                description: property.description || '',
                type: property.type || 'house',
                status: property.status || 'for-sale',
                price: property.price || '',
                address: property.address || '',
                city: property.city || '',
                state: property.state || '',
                lat: property.lat || '',
                lng: property.lng || '',
                bedrooms: property.bedrooms || '',
                bathrooms: property.bathrooms || '',
                area: property.area || '',
            });

            // Set existing images
            if (property.images && property.images.length > 0) {
                setExistingImages(property.images);
            }
        } else {
            setFormError('Property not found');
        }
    }, [id, userProperties]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        
        // Create preview URLs for new images
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...previews]);
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
            // Prepare update data
            const updateData = {
                ...formData,
                images: newImages,
                removedImages: removedImageIds
            };
            
            await updateProperty(id, updateData);
            
            // Refresh the properties list to get updated data
            await getUserProperties();
            
            setSuccess(true);
            
            // Redirect to profile page after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setFormError(err.message || 'Failed to update property');
        }
    };
    
    const removeExistingImage = (image) => {
        setExistingImages(prev => prev.filter(img => img._id !== image._id));
        setRemovedImageIds(prev => [...prev, image._id]);
    };

    const removeNewImage = (index) => {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(newImagePreviews[index]);
        
        // Remove the image and its preview
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
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
                <h1>Edit Property</h1>
                <button 
                    className="back-button"
                    onClick={() => navigate('/profile')}
                >
                    Back to Profile
                </button>
            </div>
            
            {success ? (
                <div className="success-message">
                    <h2>Property Updated Successfully!</h2>
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
                                <label htmlFor="images">Upload Additional Images</label>
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
                        
                        {/* Display existing images */}
                        {existingImages.length > 0 && (
                            <div>
                                <h3>Existing Images</h3>
                                <div className="image-preview-container">
                                    {existingImages.map((image) => (
                                        <div key={image._id} className="image-preview">
                                            <img src={image.url} alt="Property" />
                                            <button 
                                                type="button" 
                                                className="remove-image"
                                                onClick={() => removeExistingImage(image)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Display new images */}
                        {newImagePreviews.length > 0 && (
                            <div>
                                <h3>New Images</h3>
                                <div className="image-preview-container">
                                    {newImagePreviews.map((preview, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={preview} alt={`New upload ${index + 1}`} />
                                            <button 
                                                type="button" 
                                                className="remove-image"
                                                onClick={() => removeNewImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                            {loading ? 'Updating...' : 'Update Property'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default EditProperty; 