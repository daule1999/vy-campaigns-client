const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    appName: import.meta.env.VITE_APP_NAME || 'VY Campaigns',
    debugLogs: import.meta.env.VITE_DEBUG_LOGS === 'true',

    features: {
        auditLogs: true,
        externalApiImport: true,
        scheduling: false,
    },

    pagination: {
        defaultLimit: 25,
        maxLimit: 100,
    }
};

// Custom logger that respects debug setting
export const logger = {
    log: (...args) => config.debugLogs && console.log(...args),
    error: (...args) => config.debugLogs && console.error(...args),
    warn: (...args) => config.debugLogs && console.warn(...args),
    info: (...args) => config.debugLogs && console.info(...args),
};

export default config;
