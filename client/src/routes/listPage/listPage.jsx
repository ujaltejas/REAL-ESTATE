import { useState, useEffect, useCallback } from "react";
import Card from "../../components/card/Card";
import Filter from "../../components/filter/Filter";
import './listPage.scss';
import usePropertyStore from "../../store/usePropertyStore";

function ListPage() {
    const { getAllProperties, properties, loading, error } = usePropertyStore();
    const [filters, setFilters] = useState({
        type: "",
        status: "",
        city: "",
        minPrice: "",
        maxPrice: "",
        bedrooms: "",
        bathrooms: ""
    });

    // Fetch properties on component mount
    useEffect(() => {
        getAllProperties();
    }, []);

    // Handle filter changes - memoized to prevent unnecessary re-renders
    const handleFilterChange = useCallback((filterData) => {
        setFilters(filterData);
        // Apply filters by making API call with filter parameters
        getAllProperties(filterData);
    }, [getAllProperties]);

    return (
        <div className="listPage">
            <div className="listContainer full-width">
                <div className="wrapper">
                    <Filter onFilterChange={handleFilterChange} />

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading properties...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <h3>Error loading properties</h3>
                            <p>{error}</p>
                            <button onClick={() => getAllProperties()}>Try Again</button>
                        </div>
                    ) : (
                        <>
                            <div className="results-info">
                                <h2>Properties Found: {properties.length}</h2>
                            </div>
                            <div className="property-cards">
                                {properties.length > 0 ? (
                                    properties.map((item) => (
                                        <Card key={item._id} item={{
                                            id: item._id,
                                            title: item.title,
                                            price: item.price,
                                            images: item.images.length > 0 ? item.images[0].url : null,
                                            address: `${item.location.address}, ${item.location.city}`,
                                            bedrooms: item.features.bedrooms,
                                            bathrooms: item.features.bathrooms,
                                            area: item.features.area ? `${item.features.area} sqft` : null,
                                            status: item.status
                                        }} />
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <h3>No properties match your search criteria</h3>
                                        <p>Try adjusting your filters to see more results</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListPage;