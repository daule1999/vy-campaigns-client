import { create } from 'zustand';
import { authApi } from '../api';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: [],
    isSuperAdmin: false,

    // Initialize auth state from localStorage
    init: async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { data } = await authApi.getMe();
                set({
                    user: data.data,
                    isAuthenticated: true,
                    isLoading: false,
                    permissions: data.data.permissions || [],
                    isSuperAdmin: data.data.isSuperAdmin || false
                });
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, isAuthenticated: false, isLoading: false, permissions: [], isSuperAdmin: false });
            }
        } else {
            set({ isLoading: false });
        }
    },

    // Login
    login: async (username, password) => {
        const { data } = await authApi.login(username, password);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        set({
            user: data.data.user,
            isAuthenticated: true,
            permissions: data.data.user.permissions || [],
            isSuperAdmin: data.data.user.isSuperAdmin || false
        });
        return data;
    },

    // Register
    register: async (userData) => {
        const { data } = await authApi.register(userData);
        if (data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            set({
                user: data.data.user,
                isAuthenticated: true,
                permissions: data.data.user.permissions || [],
                isSuperAdmin: data.data.user.isSuperAdmin || false
            });
        }
        return data;
    },

    // Logout
    logout: async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Ignore errors
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, permissions: [], isSuperAdmin: false });
    },

    // Check if user has a specific permission
    hasPermission: (permissionName) => {
        const { permissions, isSuperAdmin } = get();
        if (isSuperAdmin) return true;
        if (permissions.includes('*')) return true;
        return permissions.includes(permissionName);
    },

    // Check if user has any of the given permissions
    hasAnyPermission: (...permissionNames) => {
        const { permissions, isSuperAdmin } = get();
        if (isSuperAdmin) return true;
        if (permissions.includes('*')) return true;
        return permissionNames.some(p => permissions.includes(p));
    },
}));

export default useAuthStore;
