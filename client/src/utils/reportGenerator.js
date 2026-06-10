const calculateAveragePrice = (properties) => {
    if (!properties || properties.length === 0) return 0;
    const validPrices = properties.filter(p => typeof p.price === 'number' && !isNaN(p.price));
    if (validPrices.length === 0) return 0;
    return Math.round(validPrices.reduce((acc, p) => acc + p.price, 0) / validPrices.length);
};

const generateReport = (data, type, timeframe) => {
    const { properties, users } = data;
    
    // Filter data based on timeframe
    const filterByTimeframe = (items) => {
        if (!items || !Array.isArray(items)) return [];
        if (timeframe === 'all') return items;
        
        const now = new Date();
        const timeframes = {
            week: new Date(now.setDate(now.getDate() - 7)),
            month: new Date(now.setMonth(now.getMonth() - 1)),
            year: new Date(now.setFullYear(now.getFullYear() - 1))
        };
        
        return items.filter(item => new Date(item.createdAt) >= timeframes[timeframe]);
    };

    const filteredProperties = filterByTimeframe(properties);
    const filteredUsers = filterByTimeframe(users);

    // Generate report content based on type
    const reports = {
        overview: () => ({
            title: 'Overview Report',
            timestamp: new Date().toLocaleString(),
            timeframe,
            data: {
                totalProperties: filteredProperties.length,
                totalUsers: filteredUsers.length,
                propertyStats: {
                    forSale: filteredProperties.filter(p => p.status === 'for-sale').length,
                    forRent: filteredProperties.filter(p => p.status === 'for-rent').length,
                    sold: filteredProperties.filter(p => p.status === 'sold').length,
                    rented: filteredProperties.filter(p => p.status === 'rented').length
                },
                userStats: {
                    agents: filteredUsers.filter(u => u.role === 'agent').length,
                    regularUsers: filteredUsers.filter(u => u.role === 'user').length
                },
                averagePrices: {
                    overall: calculateAveragePrice(filteredProperties),
                    byType: {
                        house: calculateAveragePrice(filteredProperties.filter(p => p.type === 'house')),
                        apartment: calculateAveragePrice(filteredProperties.filter(p => p.type === 'apartment')),
                        commercial: calculateAveragePrice(filteredProperties.filter(p => p.type === 'commercial'))
                    }
                }
            }
        }),
        properties: () => ({
            title: 'Properties Analysis Report',
            timestamp: new Date().toLocaleString(),
            timeframe,
            data: {
                totalCount: filteredProperties.length,
                byType: {
                    house: filteredProperties.filter(p => p.type === 'house').length,
                    apartment: filteredProperties.filter(p => p.type === 'apartment').length,
                    commercial: filteredProperties.filter(p => p.type === 'commercial').length
                },
                byStatus: {
                    forSale: filteredProperties.filter(p => p.status === 'for-sale').length,
                    forRent: filteredProperties.filter(p => p.status === 'for-rent').length,
                    sold: filteredProperties.filter(p => p.status === 'sold').length,
                    rented: filteredProperties.filter(p => p.status === 'rented').length
                },
                averagePrices: {
                    overall: calculateAveragePrice(filteredProperties),
                    byType: {
                        house: calculateAveragePrice(filteredProperties.filter(p => p.type === 'house')),
                        apartment: calculateAveragePrice(filteredProperties.filter(p => p.type === 'apartment')),
                        commercial: calculateAveragePrice(filteredProperties.filter(p => p.type === 'commercial'))
                    }
                },
                properties: filteredProperties.map(p => ({
                    id: p._id,
                    title: p.title,
                    type: p.type,
                    status: p.status,
                    price: p.price,
                    location: `${p.location.city}, ${p.location.state}`,
                    createdAt: new Date(p.createdAt).toLocaleDateString()
                }))
            }
        }),
        users: () => ({
            title: 'User Statistics Report',
            timestamp: new Date().toLocaleString(),
            timeframe,
            data: {
                totalUsers: filteredUsers.length,
                byRole: {
                    agents: filteredUsers.filter(u => u.role === 'agent').length,
                    users: filteredUsers.filter(u => u.role === 'user').length
                },
                userList: filteredUsers.map(u => ({
                    id: u._id,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                    propertiesCount: properties.filter(p => p.owner === u._id).length,
                    joinedAt: new Date(u.createdAt).toLocaleDateString()
                }))
            }
        })
    };

    return reports[type]();
};

const downloadReport = (reportData) => {
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${reportData.timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export { generateReport, downloadReport }; 