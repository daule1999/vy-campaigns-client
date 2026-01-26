import api from './axios';

/**
 * Campaign Analytics API Service
 */
export const campaignAnalyticsService = {
    /**
     * Get campaign analytics
     * @param {number} campaignId - Campaign ID
     * @returns {Promise} Analytics data
     */
    getAnalytics: async (campaignId) => {
        const response = await api.get(`/api/campaigns/${campaignId}/analytics`);
        return response.data;
    },

    /**
     * Get users by status
     * @param {number} campaignId - Campaign ID
     * @param {string} status - Status (attempted, sent, delivered, read, replied, failed_meta, failed_other)
     * @param {object} params - Query params (page, limit, search)
     * @returns {Promise} User list
     */
    getUsersByStatus: async (campaignId, status, params = {}) => {
        const response = await api.get(`/api/campaigns/${campaignId}/users/${status}`, {
            params,
        });
        return response.data;
    },

    /**
     * Refresh campaign analytics
     * @param {number} campaignId - Campaign ID
     * @returns {Promise} Updated counters
     */
    refreshAnalytics: async (campaignId) => {
        const response = await api.post(`/api/campaigns/${campaignId}/refresh`);
        return response.data;
    },

    /**
     * Export campaign report
     * @param {number} campaignId - Campaign ID
     * @returns {Promise} CSV blob
     */
    exportReport: async (campaignId) => {
        const response = await api.get(`/api/campaigns/${campaignId}/export`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Retry failed messages
     * @param {number} campaignId - Campaign ID
     * @returns {Promise} Retry result
     */
    retryFailed: async (campaignId) => {
        const response = await api.post(`/api/campaigns/${campaignId}/retry-failed`);
        return response.data;
    },
};

/**
 * General Campaign API Service
 */
export const campaignService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/campaigns', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/campaigns/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/campaigns', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/campaigns/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/campaigns/${id}`);
        return response.data;
    },

    send: async (id) => {
        const response = await api.post(`/api/campaigns/${id}/send`);
        return response.data;
    },
};
