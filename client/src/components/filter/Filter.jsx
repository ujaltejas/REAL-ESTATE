import { useState, useEffect } from 'react';
import './filter.scss'

function Filter({ onFilterChange }) {
    const [filters, setFilters] = useState({
        city: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        status: '',
        type: ''
    });

    // Apply filters in real-time whenever they change
    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = () => {
        const clearedFilters = {
            city: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
            status: '',
            type: ''
        };
        setFilters(clearedFilters);
    };

    return (
        <div className="filter">
            <div className="filter-header">
                <h1>Filters</h1>
                <button type="button" className="clear-button" onClick={handleClear}>
                    Clear All
                </button>
            </div>
            <div className="top">
                <div className="item">
                    <label htmlFor="city">City</label>
                    <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        placeholder='Search by city' 
                        value={filters.city}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="price-range">
                <div className="item">
                    <label htmlFor="minPrice">Min Price</label>
                    <input 
                        type="number" 
                        id="minPrice" 
                        name="minPrice" 
                        placeholder='Min ₹' 
                        value={filters.minPrice}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="item">
                    <label htmlFor="maxPrice">Max Price</label>
                    <input 
                        type="number" 
                        id="maxPrice" 
                        name="maxPrice" 
                        placeholder='Max ₹' 
                        value={filters.maxPrice}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="bottom">
                <div className="item">
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <select 
                        name="bedrooms" 
                        id="bedrooms"
                        value={filters.bedrooms}
                        onChange={handleInputChange}
                    >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                </div>

                <div className="item">
                    <label htmlFor="bathrooms">Bathrooms</label>
                    <select 
                        name="bathrooms" 
                        id="bathrooms"
                        value={filters.bathrooms}
                        onChange={handleInputChange}
                    >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                    </select>
                </div>

                <div className="item">
                    <label htmlFor="status">Status</label>
                    <select 
                        name="status" 
                        id="status"
                        value={filters.status}
                        onChange={handleInputChange}
                    >
                        <option value="">Any</option>
                        <option value="for-sale">For Sale</option>
                        <option value="for-rent">For Rent</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                    </select>
                </div>

                <div className="item">
                    <label htmlFor="type">Type</label>
                    <select 
                        name="type" 
                        id="type"
                        value={filters.type}
                        onChange={handleInputChange}
                    >
                        <option value="">Any</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default Filter