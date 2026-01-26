import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';

import Dashboard from './features/dashboard/Dashboard';
import CampaignsList from './features/campaigns/CampaignsList';
import CampaignNew from './features/campaigns/CampaignNew';
import CampaignDetail from './features/campaigns/CampaignDetail';
import Templates from './features/templates/Templates';
import Contacts from './features/contacts/Contacts';
import Persons from './features/persons/Persons';
import AuditLogs from './features/audit/AuditLogs';
import AdminUsers from './features/admin/AdminUsers';
import QueueStatus from './features/queue/QueueStatus';
import Autoresponders from './features/autoresponders/Autoresponders';
import Groups from './features/rbac/Groups';
import Permissions from './features/rbac/Permissions';

// Workflow System
import Products from './features/products/Products';
import WorkflowBuilder from './features/products/WorkflowBuilder';
import Applications from './features/products/Applications';
import ApplicationDetail from './features/products/ApplicationDetail';
import Workqueue from './features/workqueue/Workqueue';

// Superadmin Tools
import WhatsAppTesting from './pages/WhatsAppTesting';

// NEW INTERAKT-LIKE FEATURES
import Teams from './features/teams/Teams';
import Agents from './features/agents/Agents';
import InboxSettings from './features/inbox-settings/InboxSettings';
import QuickReplies from './features/quick-replies/QuickReplies';
import Workflows from './features/workflows/Workflows';
import Tags from './features/tags/Tags';
import Events from './features/events/Events';
import ConversationAnalytics from './features/analytics/ConversationAnalytics';
import AgentPerformance from './features/analytics/AgentPerformance';

// Settings Pages
import CustomFields from './pages/Settings/CustomFields';
import TagManagement from './pages/Settings/TagManagement';

// Additional Pages
import ContactDetail from './pages/Contacts/ContactDetail';

import { Box, CircularProgress } from '@mui/material';

// Protected route wrapper
function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, isLoading, hasPermission, isSuperAdmin } = useAuthStore();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permission if specified
  if (permission && !isSuperAdmin && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

// Auth route wrapper (redirects to home if authenticated)
function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { init } = useAuthStore();
  
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute permission="campaigns:read"><CampaignsList /></ProtectedRoute>} />
        <Route path="/campaigns/new" element={<ProtectedRoute permission="campaigns:write"><CampaignNew /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute permission="campaigns:read"><CampaignDetail /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute permission="templates:read"><Templates /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute permission="persons:read"><Contacts /></ProtectedRoute>} />
        <Route path="/persons" element={<ProtectedRoute permission="persons:read"><Persons /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute permission="audit:read"><AuditLogs /></ProtectedRoute>} />
        <Route path="/autoresponders" element={<ProtectedRoute permission="autoresponders:read"><Autoresponders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute permission="admin:users"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/groups" element={<ProtectedRoute permission="rbac:read"><Groups /></ProtectedRoute>} />
        <Route path="/admin/permissions" element={<ProtectedRoute permission="rbac:read"><Permissions /></ProtectedRoute>} />
        <Route path="/admin/queue" element={<ProtectedRoute permission="admin:users"><QueueStatus /></ProtectedRoute>} />
        
        {/* Workflow System Routes */}
        <Route path="/products" element={<ProtectedRoute permission="products:read"><Products /></ProtectedRoute>} />
        <Route path="/products/:productId/workflow" element={<ProtectedRoute permission="products:read"><WorkflowBuilder /></ProtectedRoute>} />
        <Route path="/products/:productId/applications" element={<ProtectedRoute permission="applications:read"><Applications /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute permission="applications:read"><ApplicationDetail /></ProtectedRoute>} />
        <Route path="/workqueue" element={<ProtectedRoute permission="workqueue:access"><Workqueue /></ProtectedRoute>} />
        
        {/* Superadmin Tools */}
        <Route path="/admin/whatsapp-testing" element={<ProtectedRoute><WhatsAppTesting /></ProtectedRoute>} />
        
        {/* NEW INTERAKT-LIKE FEATURES */}
        {/* Team & Agent Management */}
        <Route path="/teams" element={<ProtectedRoute permission="teams:read"><Teams /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute permission="agents:read"><Agents /></ProtectedRoute>} />
        
        {/* Automation Settings */}
        <Route path="/settings/inbox" element={<ProtectedRoute permission="inbox_settings:read"><InboxSettings /></ProtectedRoute>} />
        <Route path="/settings/quick-replies" element={<ProtectedRoute permission="quick_replies:read"><QuickReplies /></ProtectedRoute>} />
        <Route path="/workflows" element={<ProtectedRoute permission="workflows:read"><Workflows /></ProtectedRoute>} />
        
        {/* Contact Management */}
        <Route path="/settings/tags" element={<ProtectedRoute permission="tags:read"><Tags /></ProtectedRoute>} />
        <Route path="/settings/tags/manage" element={<ProtectedRoute permission="tags:write"><TagManagement /></ProtectedRoute>} />
        <Route path="/settings/custom-fields" element={<ProtectedRoute permission="contact_fields:read"><CustomFields /></ProtectedRoute>} />
        <Route path="/persons/:id" element={<ProtectedRoute permission="persons:read"><ContactDetail /></ProtectedRoute>} />
        
        {/* Events & Analytics */}
        <Route path="/settings/events" element={<ProtectedRoute permission="events:read"><Events /></ProtectedRoute>} />
        <Route path="/analytics/conversations" element={<ProtectedRoute permission="analytics:read"><ConversationAnalytics /></ProtectedRoute>} />
        <Route path="/analytics/agents" element={<ProtectedRoute permission="analytics:read"><AgentPerformance /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

