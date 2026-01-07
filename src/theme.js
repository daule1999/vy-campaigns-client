import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#25d366', // WhatsApp Green
            light: '#5cfda6',
            dark: '#128c7e',
            contrastText: '#fff',
        },
        secondary: {
            main: '#4f8cff', // Accent Blue
            light: '#85b6ff',
            dark: '#0062cc',
            contrastText: '#fff',
        },
        error: {
            main: '#ff6b6b',
        },
        warning: {
            main: '#ff9f43',
        },
        success: {
            main: '#25d366',
        },
        background: {
            default: '#0a0a0f', // --bg-primary
            paper: '#12121a', // --bg-secondary
            tertiary: '#1a1a25', // --bg-tertiary
            card: 'rgba(26, 26, 37, 0.8)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
            disabled: '#606070',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 20px',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#12121a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0a0a0f',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0a0a0f',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
    },
});

export default theme;
