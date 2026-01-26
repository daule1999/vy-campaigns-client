import api from './axios';

/**
 * Events API Service
 */
export const eventsService = {
    // Track event
    track: async (data) => {
        const response = await api.post('/api/events/track', data);
        return response.data;
    },

    // Get all events
    getAll: async (params = {}) => {
        const response = await api.get('/api/events', { params });
        return response.data;
    },

    // Get button click analytics
    getButtonAnalytics: async (params = {}) => {
        const response = await api.get('/api/events/button-clicks/analytics', { params });
        return response.data;
    },

    // Get users who clicked a specific button
    getButtonUsers: async (params = {}) => {
        const response = await api.get('/api/events/button-clicks/users', { params });
        return response.data;
    },

    // Get events analytics overview
    getAnalyticsOverview: async (params = {}) => {
        const response = await api.get('/api/events/analytics/overview', { params });
        return response.data;
    },
};
