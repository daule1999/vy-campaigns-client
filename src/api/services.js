import api from './axios';

/**
 * Workflow API Service
 */
export const workflowService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/workflows', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/workflows/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/workflows', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/workflows/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/workflows/${id}`);
        return response.data;
    },

    activate: async (id) => {
        const response = await api.post(`/api/workflows/${id}/activate`);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.post(`/api/workflows/${id}/deactivate`);
        return response.data;
    },

    execute: async (id, data) => {
        const response = await api.post(`/api/workflows/${id}/execute`, data);
        return response.data;
    },

    getExecutions: async (id, params = {}) => {
        const response = await api.get(`/api/workflows/${id}/executions`, { params });
        return response.data;
    },

    getExecutionLogs: async (id, executionId) => {
        const response = await api.get(`/api/workflows/${id}/executions/${executionId}`);
        return response.data;
    },

    duplicate: async (id) => {
        const response = await api.post(`/api/workflows/${id}/duplicate`);
        return response.data;
    },
};

/**
 * Contact API Service
 */
export const contactService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/contacts', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/contacts/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/contacts', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/contacts/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/contacts/${id}`);
        return response.data;
    },

    addTags: async (contactId, tagIds) => {
        const response = await api.post(`/api/contacts/${contactId}/tags`, { tagIds });
        return response.data;
    },

    removeTags: async (contactId, tagIds) => {
        const response = await api.delete(`/api/contacts/${contactId}/tags`, { data: { tagIds } });
        return response.data;
    },

    updateFields: async (contactId, fields) => {
        const response = await api.put(`/api/contacts/${contactId}/fields`, { fields });
        return response.data;
    },
};

/**
 * Tags API Service
 */
export const tagService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/tags', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/tags', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/tags/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/tags/${id}`);
        return response.data;
    },

    addToContacts: async (tagId, contactIds) => {
        const response = await api.post(`/api/tags/${tagId}/contacts`, { contactIds });
        return response.data;
    },

    removeFromContact: async (tagId, contactId) => {
        const response = await api.delete(`/api/tags/${tagId}/contacts/${contactId}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/api/tags/categories');
        return response.data;
    },
};

/**
 * Contact Fields API Service
 */
export const contactFieldService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/contact-fields', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/contact-fields', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/contact-fields/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/contact-fields/${id}`);
        return response.data;
    },
};

/**
 * RBAC API Services
 */
export const roleService = {
    getAll: async () => {
        const response = await api.get('/api/roles');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/roles/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/roles', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/roles/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/roles/${id}`);
        return response.data;
    },

    addPermissions: async (roleId, permissionIds) => {
        const response = await api.post(`/api/roles/${roleId}/permissions`, { permissionIds });
        return response.data;
    },

    removePermissions: async (roleId, permissionIds) => {
        const response = await api.delete(`/api/roles/${roleId}/permissions`, { data: { permissionIds } });
        return response.data;
    },

    assignToUsers: async (roleId, userIds) => {
        const response = await api.post(`/api/roles/${roleId}/users`, { userIds });
        return response.data;
    },

    removeFromUsers: async (roleId, userIds) => {
        const response = await api.delete(`/api/roles/${roleId}/users`, { data: { userIds } });
        return response.data;
    },
};

export const permissionService = {
    getAll: async () => {
        const response = await api.get('/api/permissions');
        return response.data;
    },

    getByFeature: async () => {
        const response = await api.get('/api/permissions/grouped');
        return response.data;
    },
};

export const teamService = {
    getAll: async () => {
        const response = await api.get('/api/teams');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/teams/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/teams', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/teams/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/teams/${id}`);
        return response.data;
    },

    addMembers: async (teamId, userIds) => {
        const response = await api.post(`/api/teams/${teamId}/members`, { userIds });
        return response.data;
    },

    removeMembers: async (teamId, userIds) => {
        const response = await api.delete(`/api/teams/${teamId}/members`, { data: { userIds } });
        return response.data;
    },

    promoteToLead: async (teamId, userId) => {
        const response = await api.post(`/api/teams/${teamId}/lead`, { userId });
        return response.data;
    },
};

export const agentService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/agents', { params });
        return response.data;
    },

    invite: async (data) => {
        const response = await api.post('/api/agents/invite', data);
        return response.data;
    },

    assignRoles: async (userId, roleIds) => {
        const response = await api.post(`/api/agents/${userId}/roles`, { roleIds });
        return response.data;
    },

    updateStatus: async (userId, status) => {
        const response = await api.put(`/api/agents/${userId}/status`, { status });
        return response.data;
    },

    resendInvite: async (userId) => {
        const response = await api.post(`/api/agents/${userId}/resend-invite`);
        return response.data;
    },
};

/**
 * Quick Replies API Service
 */
export const quickReplyService = {
    getAll: async (params = {}) => {
        const response = await api.get('/api/quick-replies', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/quick-replies', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/quick-replies/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/quick-replies/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/api/quick-replies/categories');
        return response.data;
    },
};

/**
 * Inbox Settings API Service
 */
export const inboxSettingsService = {
    get: async () => {
        const response = await api.get('/api/inbox-settings');
        return response.data;
    },

    updateWelcomeMessage: async (data) => {
        const response = await api.put('/api/inbox-settings/welcome-message', data);
        return response.data;
    },

    updateOOO: async (data) => {
        const response = await api.put('/api/inbox-settings/out-of-office', data);
        return response.data;
    },

    updateDelayedResponse: async (data) => {
        const response = await api.put('/api/inbox-settings/delayed-response', data);
        return response.data;
    },

    updateWorkingHours: async (data) => {
        const response = await api.put('/api/inbox-settings/working-hours', data);
        return response.data;
    },

    updateAutoAssignment: async (data) => {
        const response = await api.put('/api/inbox-settings/auto-assignment', data);
        return response.data;
    },

    testMessage: async (data) => {
        const response = await api.post('/api/inbox-settings/test', data);
        return response.data;
    },
};

// Re-export campaign services for component convenience
export * from './campaigns.service';
