# VY Campaigns Web Client

Modern web application for WhatsApp campaign management built with React, Vite, and Material-UI.

## 🚀 Features

- **Campaign Management** - Create, schedule, and monitor WhatsApp campaigns
- **Template Builder** - Design and manage WhatsApp message templates
- **Contact Management** - Organize and import contacts
- **Product Catalog** - Maintain product information
- **Automated Workflows** - Set up autoresponder rules
- **Work Queue** - Manage and assign work items
- **Analytics Dashboard** - Track campaign performance
- **Role-Based Access** - User and permission management
- **Audit Logging** - View system activity

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/daule1999/vy-campaigns-client.git
cd vy-campaigns-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

For production:
```bash
VITE_API_URL=https://your-api-domain.com/api
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🎨 Tech Stack

- **React** 19.2 - UI library
- **Vite** 7.2 - Build tool and dev server
- **Material-UI (MUI)** 7.x - Component library
- **React Router** 7.11 - Client-side routing
- **Zustand** 5.0 - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📁 Project Structure

```
vy-campaigns-client/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Root component with routing
│   ├── theme.js              # MUI theme configuration
│   ├── config/
│   │   └── api.js            # API configuration
│   ├── api/
│   │   └── client.js         # Axios instance
│   ├── store/
│   │   └── authStore.js      # Authentication state
│   ├── components/           # Reusable components
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── features/             # Feature modules
│   │   ├── auth/             # Authentication
│   │   ├── dashboard/        # Dashboard & stats
│   │   ├── campaigns/        # Campaign management
│   │   ├── templates/        # Template management
│   │   ├── persons/          # Contact management
│   │   ├── products/         # Product catalog
│   │   ├── autoresponders/   # Workflow automation
│   │   ├── workqueue/        # Work item queue
│   │   ├── rbac/             # User & role management
│   │   ├── audit/            # Audit logs
│   │   └── admin/            # Admin panel
│   └── assets/               # Static assets
├── public/                   # Public static files
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── package.json
└── README.md
```

## 🎨 Features Overview

### Dashboard
- Campaign statistics
- Recent activity
- Quick actions
- System health

### Campaign Management
- Create and schedule campaigns
- Bulk messaging
- Template selection
- Contact targeting
- Real-time status tracking

### Template Management
- Create WhatsApp templates
- Template preview
- Variable support
- Multi-language templates

### Contact Management
- Add/edit contacts
- Bulk import (CSV, Excel)
- Contact groups
- Search and filter

### Product Catalog
- Product CRUD operations
- Image upload
- Categorization
- Search functionality

### Autoresponders
- Rule-based automation
- Trigger configuration
- Action workflows
- Condition builder

### Work Queue
- Task assignment
- Queue monitoring
- Claim/complete workflows
- Status tracking

### User Management
- User CRUD operations
- Role assignment
- Group management
- Permission control

### Audit Logs
- Activity tracking
- Filter by user/action
- Detailed event view
- Export functionality

## 🔐 Authentication

The application uses JWT-based authentication:

1. Login with email and password
2. JWT token stored in localStorage
3. Token automatically included in API requests
4. Auto-logout on token expiration

### Default Credentials
- **Email**: `admin@admin.com`
- **Password**: `admin123`

**⚠️ Change these credentials after first login!**

## 🚀 Deployment

### Deploy to Vercel

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variables:
   - `VITE_API_URL` - Your API server URL
5. Deploy

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Configure environment variables in Netlify dashboard.

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com/api` |

**Note**: Vite requires all environment variables to be prefixed with `VITE_` to be exposed to the client.

## 🔧 Configuration

### API Client

The API client is configured in `src/api/client.js`:

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-include JWT token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Theme Customization

Edit `src/theme.js` to customize the Material-UI theme:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // ... more customizations
});
```

## 🧪 Testing

Currently, the project uses manual testing. Plans for automated testing:

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 🐛 Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` is correctly set
- Check backend server is running
- Check browser console for CORS errors
- Ensure API server allows the frontend origin

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version: `node --version` (should be 18+)

### Authentication Issues
- Clear localStorage and re-login
- Check token expiration
- Verify credentials with backend

## 📝 Best Practices

1. **Component Organization**: Keep components small and focused
2. **State Management**: Use Zustand for global state, local state for component-specific data
3. **API Calls**: Always handle loading and error states
4. **Routing**: Use `ProtectedRoute` for authenticated pages
5. **Styling**: Use MUI's `sx` prop for component-specific styles

## 🔄 Updates

To update dependencies:

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

## 📄 License

Proprietary - VY Campaigns

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for efficient campaign management**
