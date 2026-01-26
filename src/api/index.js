import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, { refreshToken });

                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);

                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// Templates API
export const templatesApi = {
    getAll: (params) => api.get('/templates', { params }),
    getById: (id) => api.get(`/templates/${id}`),
    create: (data) => api.post('/templates', data),
    sync: () => api.post('/templates/sync'),
    update: (id, data) => api.put(`/templates/${id}`, data),
    delete: (id) => api.delete(`/templates/${id}`),
};

// Contacts API (Legacy - use personsApi instead)
export const contactsApi = {
    getAll: (params) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
    bulkDelete: (ids) => api.post('/contacts/bulk-delete', { ids }),
    importCsv: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/contacts/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    importApi: (data) => api.post('/contacts/import-api', data),
};

// Persons API (New)
export const personsApi = {
    getAll: (params) => api.get('/persons', { params }),
    getById: (id) => api.get(`/persons/${id}`),
    create: (data) => api.post('/persons', data),
    update: (id, data) => api.put(`/persons/${id}`, data),
    delete: (id) => api.delete(`/persons/${id}`),
    bulkDelete: (ids) => api.post('/persons/bulk-delete', { ids }),
    addTags: (id, tags) => api.post(`/persons/${id}/tags`, { tags }),
    importCsv: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/persons/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Campaigns API
export const campaignsApi = {
    getAll: (params) => api.get('/campaigns', { params }),
    getById: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', data),
    update: (id, data) => api.put(`/campaigns/${id}`, data),
    delete: (id) => api.delete(`/campaigns/${id}`),
    addContacts: (id, contactIds) => api.post(`/campaigns/${id}/contacts`, { contact_ids: contactIds }),
    removeContacts: (id, contactIds) => api.delete(`/campaigns/${id}/contacts`, { data: { contact_ids: contactIds } }),
    send: (id) => api.post(`/campaigns/${id}/send`),
    getErrors: (id) => api.get(`/campaigns/${id}/errors`),
};

// Audit API
export const auditApi = {
    getAll: (params) => api.get('/audit', { params }),
};

// Admin API
export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    createUser: (data) => api.post('/admin/users', data),
    activateUser: (id) => api.post(`/admin/users/${id}/activate`),
    deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`),
    updateUserGroups: (id, groupIds) => api.put(`/admin/users/${id}/groups`, { groupIds }),
    generateApiKey: (id) => api.post(`/admin/users/${id}/api-key`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getGroups: () => api.get('/admin/groups'),
    resetPassword: (id, newPassword) => api.put(`/admin/users/${id}/reset-password`, { newPassword }),
};

// RBAC API
export const rbacApi = {
    // Permissions
    getPermissions: () => api.get('/rbac/permissions'),
    createPermission: (data) => api.post('/rbac/permissions', data),
    updatePermission: (id, data) => api.put(`/rbac/permissions/${id}`, data),
    deletePermission: (id) => api.delete(`/rbac/permissions/${id}`),

    // Groups
    getGroups: () => api.get('/rbac/groups'),
    getGroup: (id) => api.get(`/rbac/groups/${id}`),
    createGroup: (data) => api.post('/rbac/groups', data),
    updateGroup: (id, data) => api.put(`/rbac/groups/${id}`, data),
    deleteGroup: (id) => api.delete(`/rbac/groups/${id}`),

    // Group permissions
    setGroupPermissions: (groupId, permissionIds) =>
        api.put(`/rbac/groups/${groupId}/permissions`, { permissionIds }),

    // Group users
    addGroupUsers: (groupId, userIds) =>
        api.post(`/rbac/groups/${groupId}/users`, { userIds }),
    removeGroupUser: (groupId, userId) =>
        api.delete(`/rbac/groups/${groupId}/users/${userId}`),

    // User permissions
    getUserPermissions: (userId) => api.get(`/rbac/users/${userId}/permissions`),
    setUserGroups: (userId, groupIds) => api.put(`/rbac/users/${userId}/groups`, { groupIds }),

    getGroupMembers: (groupId) => api.get(`/rbac/groups/${groupId}/members`),
};

// Dashboard API
export const dashboardApi = {
    getStats: () => api.get('/dashboard'),
    getHealth: () => api.get('/health'),
};

// Queue API
export const queueApi = {
    getStatus: () => api.get('/queue/status'),
};

// Autoresponders API (Chatbot Workflows)
export const autorespondersApi = {
    getAll: () => api.get('/autoresponders'),
    getById: (id) => api.get(`/autoresponders/${id}`),
    create: (data) => api.post('/autoresponders', data),
    update: (id, data) => api.put(`/autoresponders/${id}`, data),
    delete: (id) => api.delete(`/autoresponders/${id}`),
    toggle: (id) => api.patch(`/autoresponders/${id}/toggle`),
};

// Campaign Products API
export const productsApi = {
    getAll: (params = {}) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    // Workflow & Steps
    getWorkflow: (productId) => api.get(`/products/${productId}/workflow`),
    addStep: (productId, data) => api.post(`/products/${productId}/workflow/steps`, data),
    updateStep: (stepId, data) => api.put(`/products/workflow-steps/${stepId}`, data),
    deleteStep: (stepId) => api.delete(`/products/workflow-steps/${stepId}`),
    reorderSteps: (productId, stepOrder) => api.put(`/products/${productId}/workflow/reorder`, { stepOrder }),
    // Applications
    getApplications: (productId, params = {}) => api.get(`/products/${productId}/applications`, { params }),
    createApplication: (productId, data) => api.post(`/products/${productId}/applications`, data),
    importApplications: (productId, formData) => api.post(`/products/${productId}/applications/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Applications API
export const applicationsApi = {
    getAll: (params = {}) => api.get('/applications', { params }),
    getById: (id) => api.get(`/applications/${id}`),
    updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
    // Workqueue
    getWorkqueue: () => api.get('/applications/workqueue/list'),
    getNext: () => api.get('/applications/workqueue/next'),
    claim: (applicationId, executionId) => api.post(`/applications/${applicationId}/claim`, { executionId }),
    release: (applicationId, executionId) => api.post(`/applications/${applicationId}/release`, { executionId }),
    reassign: (applicationId, executionId, userId) => api.post(`/applications/${applicationId}/reassign`, { executionId, userId }),
    submitStep: (applicationId, stepId, data) => api.post(`/applications/${applicationId}/steps/${stepId}/submit`, data),
    rejectStep: (applicationId, stepId, data) => api.post(`/applications/${applicationId}/steps/${stepId}/reject`, data),
};

// ============================================
// NEW INTERAKT-LIKE FEATURES
// ============================================

// Teams API
export const teamsApi = {
    getAll: (params = {}) => api.get('/teams', { params }),
    getById: (id) => api.get(`/teams/${id}`),
    create: (data) => api.post('/teams', data),
    update: (id, data) => api.put(`/teams/${id}`, data),
    delete: (id) => api.delete(`/teams/${id}`),
    // Members
    getMembers: (teamId) => api.get(`/teams/${teamId}/members`),
    addMembers: (teamId, userIds) => api.post(`/teams/${teamId}/members`, { userIds }),
    removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
    setLeads: (teamId, leadIds) => api.put(`/teams/${teamId}/leads`, { leadIds }),
};

// Agents API
export const agentsApi = {
    getAll: (params = {}) => api.get('/agents', { params }),
    getById: (id) => api.get(`/agents/${id}`),
    invite: (data) => api.post('/agents/invite', data),
    update: (id, data) => api.put(`/agents/${id}`, data),
    delete: (id) => api.delete(`/agents/${id}`),
    resendInvitation: (id) => api.post(`/agents/${id}/resend-invitation`),
    activate: (id) => api.post(`/agents/${id}/activate`),
    deactivate: (id) => api.post(`/agents/${id}/deactivate`),
    setRole: (id, roleId) => api.put(`/agents/${id}/role`, { roleId }),
    getStats: (id, params = {}) => api.get(`/agents/${id}/stats`, { params }),
};

// Roles API
export const rolesApi = {
    getAll: () => api.get('/roles'),
    getById: (id) => api.get(`/roles/${id}`),
    create: (data) => api.post('/roles', data),
    update: (id, data) => api.put(`/roles/${id}`, data),
    delete: (id) => api.delete(`/roles/${id}`),
    getPermissions: (roleId) => api.get(`/roles/${roleId}/permissions`),
    setPermissions: (roleId, permissionIds) => api.put(`/roles/${roleId}/permissions`, { permissionIds }),
};

// Permissions API
export const permissionsApi = {
    getAll: () => api.get('/permissions'),
    getCategories: () => api.get('/permissions/categories'),
};

// Quick Replies API
export const quickRepliesApi = {
    getAll: (params = {}) => api.get('/quick-replies', { params }),
    getById: (id) => api.get(`/quick-replies/${id}`),
    create: (data) => api.post('/quick-replies', data),
    update: (id, data) => api.put(`/quick-replies/${id}`, data),
    delete: (id) => api.delete(`/quick-replies/${id}`),
    getCategories: () => api.get('/quick-replies/categories'),
};

// Inbox Settings API
export const inboxSettingsApi = {
    get: () => api.get('/inbox-settings'),
    update: (data) => api.put('/inbox-settings', data),
    // Welcome Message
    getWelcomeMessage: () => api.get('/inbox-settings/welcome-message'),
    updateWelcomeMessage: (data) => api.put('/inbox-settings/welcome-message', data),
    // Out of Office
    getOutOfOffice: () => api.get('/inbox-settings/out-of-office'),
    updateOutOfOffice: (data) => api.put('/inbox-settings/out-of-office', data),
    // Delayed Response
    getDelayedResponse: () => api.get('/inbox-settings/delayed-response'),
    updateDelayedResponse: (data) => api.put('/inbox-settings/delayed-response', data),
    // Working Hours
    getWorkingHours: () => api.get('/inbox-settings/working-hours'),
    updateWorkingHours: (data) => api.put('/inbox-settings/working-hours', data),
    // Auto Assignment
    getAutoAssignment: () => api.get('/inbox-settings/auto-assignment'),
    updateAutoAssignment: (data) => api.put('/inbox-settings/auto-assignment', data),
};

// Workflows API (Automation)
export const workflowsApi = {
    getAll: (params = {}) => api.get('/workflows', { params }),
    getById: (id) => api.get(`/workflows/${id}`),
    create: (data) => api.post('/workflows', data),
    update: (id, data) => api.put(`/workflows/${id}`, data),
    delete: (id) => api.delete(`/workflows/${id}`),
    activate: (id) => api.post(`/workflows/${id}/activate`),
    deactivate: (id) => api.post(`/workflows/${id}/deactivate`),
    execute: (id, data) => api.post(`/workflows/${id}/execute`, data),
    getExecutions: (id, params = {}) => api.get(`/workflows/${id}/executions`, { params }),
    getExecutionLogs: (id, executionId) => api.get(`/workflows/${id}/executions/${executionId}`),
    duplicate: (id) => api.post(`/workflows/${id}/duplicate`),
    // Nodes & Edges
    getNodes: (id) => api.get(`/workflows/${id}/nodes`),
    updateNodes: (id, nodes) => api.put(`/workflows/${id}/nodes`, { nodes }),
    getEdges: (id) => api.get(`/workflows/${id}/edges`),
    updateEdges: (id, edges) => api.put(`/workflows/${id}/edges`, { edges }),
};

// Tags API
export const tagsApi = {
    getAll: (params = {}) => api.get('/tags', { params }),
    getById: (id) => api.get(`/tags/${id}`),
    create: (data) => api.post('/tags', data),
    update: (id, data) => api.put(`/tags/${id}`, data),
    delete: (id) => api.delete(`/tags/${id}`),
    // Bulk operations
    bulkAssign: (tagId, contactIds) => api.post(`/tags/${tagId}/assign`, { contactIds }),
    bulkRemove: (tagId, contactIds) => api.post(`/tags/${tagId}/remove`, { contactIds }),
    getContacts: (tagId, params = {}) => api.get(`/tags/${tagId}/contacts`, { params }),
};

// Contact Fields API (Custom Fields)
export const contactFieldsApi = {
    getAll: (params = {}) => api.get('/contact-fields', { params }),
    getById: (id) => api.get(`/contact-fields/${id}`),
    create: (data) => api.post('/contact-fields', data),
    update: (id, data) => api.put(`/contact-fields/${id}`, data),
    delete: (id) => api.delete(`/contact-fields/${id}`),
    reorder: (fieldIds) => api.put('/contact-fields/reorder', { fieldIds }),
};

// Events API
export const eventsApi = {
    getAll: (params = {}) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    track: (data) => api.post('/events/track', data),
    // Definitions
    getDefinitions: () => api.get('/events/definitions'),
    createDefinition: (data) => api.post('/events/definitions', data),
    updateDefinition: (id, data) => api.put(`/events/definitions/${id}`, data),
    deleteDefinition: (id) => api.delete(`/events/definitions/${id}`),
    // Analytics
    getAnalytics: (params = {}) => api.get('/events/analytics', { params }),
    getByContact: (contactId, params = {}) => api.get(`/events/contacts/${contactId}`, { params }),
};

// Analytics API
export const analyticsApi = {
    // Conversation Analytics
    getConversationStats: (params = {}) => api.get('/analytics/conversations', { params }),
    getResponseTimes: (params = {}) => api.get('/analytics/response-times', { params }),
    getResolutionTimes: (params = {}) => api.get('/analytics/resolution-times', { params }),
    // Agent Performance
    getAgentStats: (params = {}) => api.get('/analytics/agents', { params }),
    getAgentPerformance: (agentId, params = {}) => api.get(`/analytics/agents/${agentId}`, { params }),
    // Campaign Analytics
    getCampaignStats: (campaignId, params = {}) => api.get(`/campaigns/${campaignId}/analytics`, { params }),
    getCampaignSummary: (params = {}) => api.get('/analytics/campaigns/summary', { params }),
    // Exports
    exportConversations: (params = {}) => api.get('/analytics/conversations/export', { params, responseType: 'blob' }),
    exportAgentStats: (params = {}) => api.get('/analytics/agents/export', { params, responseType: 'blob' }),
};

export default api;


