import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePropertyStore from '../store/usePropertyStore';
import useAdminStore from '../store/useAdminStore';
import { generateReport, downloadReport } from '../utils/reportGenerator';
import './AdminDashboard.scss';

// Helper function to safely calculate average price
const calculateAveragePrice = (properties) => {
    if (!properties || properties.length === 0) return 0;
    const validPrices = properties.filter(p => typeof p.price === 'number' && !isNaN(p.price));
    if (validPrices.length === 0) return 0;
    return Math.round(validPrices.reduce((acc, p) => acc + p.price, 0) / validPrices.length);
};

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { getAllProperties, properties, loading: propertyLoading } = usePropertyStore();
    const { getAllUsers, deleteUser, users, loading: userLoading, error } = useAdminStore();
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [reportType, setReportType] = useState('overview');
    const [reportTimeframe, setReportTimeframe] = useState('all');

    // Check if user is admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch users and properties
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getAllUsers(),
                    getAllProperties()
                ]);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [getAllUsers, getAllProperties]);

    // Filter users based on search and role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Filter properties based on search
    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to filter data by timeframe
    const filterByTimeframe = (items) => {
        if (!items || !Array.isArray(items)) return [];
        if (reportTimeframe === 'all') return items;
        
        const now = new Date();
        const timeframes = {
            week: new Date(now.setDate(now.getDate() - 7)),
            month: new Date(now.setMonth(now.getMonth() - 1)),
            year: new Date(now.setFullYear(now.getFullYear() - 1))
        };
        
        return items.filter(item => new Date(item.createdAt) >= timeframes[reportTimeframe]);
    };

    // Get filtered data based on timeframe
    const filteredReportProperties = filterByTimeframe(properties);
    const filteredReportUsers = filterByTimeframe(users);

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This will also delete all their properties.')) {
            try {
                await deleteUser(userId);
            } catch (err) {
                console.error("Failed to delete user:", err);
            }
        }
    };

    // Handle property deletion
    const handleDeleteProperty = async (propertyId) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await axiosInstance.delete(`/property/${propertyId}`);
                setProperties(properties.filter(property => property._id !== propertyId));
            } catch (err) {
                setError('Failed to delete property');
            }
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error("Failed to logout:", err);
        }
    };

    const handleDownloadReport = () => {
        const reportData = generateReport(
            { properties, users },
            reportType,
            reportTimeframe
        );
        downloadReport(reportData);
    };

    if (userLoading || propertyLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Admin Dashboard</h1>
                </div>
                <div className="dashboard-controls">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {activeTab === 'users' && (
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="role-filter"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="agent">Agents</option>
                        </select>
                    )}
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
                    onClick={() => setActiveTab('properties')}
                >
                    Properties
                </button>
                <button
                    className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-content">
                {activeTab === 'users' ? (
                    <div className="users-list">
                        <h2>Users Management</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Properties</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <img
                                                    src={user.avatar || "/default-avatar.png"}
                                                    alt={user.username}
                                                    className="user-avatar"
                                                    onError={(e) => {e.target.src = "/default-avatar.png"}}
                                                />
                                            </td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td>{properties.filter(p => p.owner._id === user._id).length}</td>
                                            <td>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'properties' ? (
                    <div className="properties-list">
                        <h2>Properties Management</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Location</th>
                                        <th>Price</th>
                                        <th>Owner</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProperties.map(property => (
                                        <tr key={property._id}>
                                            <td>
                                                <img
                                                    src={property.images[0]?.url || "/no-image.png"}
                                                    alt={property.title}
                                                    className="property-image"
                                                    onError={(e) => {e.target.src = "/no-image.png"}}
                                                />
                                            </td>
                                            <td>{property.title}</td>
                                            <td>{`${property.location.city}, ${property.location.state}`}</td>
                                            <td>₹{property.price.toLocaleString('en-IN')}</td>
                                            <td>{property.owner.username}</td>
                                            <td>
                                                <span className={`status-badge ${property.status}`}>
                                                    {property.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteProperty(property._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="reports-section">
                        <h2>Analytics & Reports</h2>
                        <div className="reports-controls">
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="report-select"
                            >
                                <option value="overview">Overview</option>
                                <option value="properties">Properties Analysis</option>
                                <option value="users">User Statistics</option>
                            </select>
                            <select
                                value={reportTimeframe}
                                onChange={(e) => setReportTimeframe(e.target.value)}
                                className="timeframe-select"
                            >
                                <option value="all">All Time</option>
                                <option value="year"> Year</option>
                                <option value="month"> Month</option>
                                <option value="week"> Week</option>
                            </select>
                            <button 
                                className="download-report-btn"
                                onClick={handleDownloadReport}
                            >
                                Download Report
                            </button>
                        </div>
                        
                        <div className="reports-grid">
                            <div className="report-card total-properties">
                                <h3>Total Properties</h3>
                                <div className="stat">{filteredReportProperties.length}</div>
                                <div className="stat-details">
                                    <div>For Sale: {filteredReportProperties.filter(p => p.status === 'for-sale').length}</div>
                                    <div>For Rent: {filteredReportProperties.filter(p => p.status === 'for-rent').length}</div>
                                    <div>Sold: {filteredReportProperties.filter(p => p.status === 'sold').length}</div>
                                    <div>Rented: {filteredReportProperties.filter(p => p.status === 'rented').length}</div>
                                </div>
                            </div>
                            
                            <div className="report-card total-users">
                                <h3>Total Users</h3>
                                <div className="stat">{filteredReportUsers.length}</div>
                                <div className="stat-details">
                                    <div>Agents: {filteredReportUsers.filter(u => u.role === 'agent').length}</div>
                                    <div>Regular Users: {filteredReportUsers.filter(u => u.role === 'user').length}</div>
                                </div>
                            </div>
                            
                            <div className="report-card property-types">
                                <h3>Property Types</h3>
                                <div className="stat">{filteredReportProperties.length}</div>
                                <div className="stat-details">
                                    <div>Houses: {filteredReportProperties.filter(p => p.type === 'house').length}</div>
                                    <div>Apartments: {filteredReportProperties.filter(p => p.type === 'apartment').length}</div>
                                    <div>Commercial: {filteredReportProperties.filter(p => p.type === 'commercial').length}</div>
                                </div>
                            </div>
                            
                            <div className="report-card average-prices">
                                <h3>Average Prices</h3>
                                <div className="stat">
                                    <p>Overall: ₹{calculateAveragePrice(filteredReportProperties).toLocaleString('en-IN')}</p>
                                    <div>Houses: ₹{calculateAveragePrice(filteredReportProperties.filter(p => p.type === 'house')).toLocaleString('en-IN')}</div>
                                    <div>Apartments: ₹{calculateAveragePrice(filteredReportProperties.filter(p => p.type === 'apartment')).toLocaleString('en-IN')}</div>
                                    <div>Commercial: ₹{calculateAveragePrice(filteredReportProperties.filter(p => p.type === 'commercial')).toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard; 