import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Chip
} from '@mui/material';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  Send, 
  ClipboardList, 
  LogOut, 
  Menu,
  ChevronLeft,
  Shield,
  Key,
  UserCog,
  Package,
  ListTodo,
  TestTube,
  UsersRound,
  UserPlus,
  Workflow,
  BarChart3,
  Settings,
  Tag,
  Zap,
  MessagesSquare,
  Timer
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import config from '../../config';

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/campaigns', icon: Send, label: 'Campaigns', permission: 'campaigns:read' },
  { path: '/templates', icon: FileText, label: 'Templates', permission: 'templates:read' },
  { path: '/persons', icon: Users, label: 'Contact Hub', permission: 'persons:read' },
  { divider: true, label: 'Team Management' },
  { path: '/teams', icon: UsersRound, label: 'Teams', permission: 'teams:read' },
  { path: '/agents', icon: UserPlus, label: 'Agents', permission: 'agents:read' },
  { divider: true, label: 'Automation' },
  { path: '/workflows', icon: Workflow, label: 'Workflows', permission: 'workflows:read' },
  { path: '/autoresponders', icon: MessageSquare, label: 'Autoresponders', permission: 'autoresponders:read' },
  { divider: true, label: 'Analytics' },
  { path: '/analytics/conversations', icon: MessagesSquare, label: 'Conversations', permission: 'analytics:read' },
  { path: '/analytics/agents', icon: BarChart3, label: 'Agent Performance', permission: 'analytics:read' },
  { divider: true, label: 'Settings' },
  { path: '/settings/inbox', icon: Timer, label: 'Inbox Settings', permission: 'inbox_settings:read' },
  { path: '/settings/quick-replies', icon: Zap, label: 'Quick Replies', permission: 'quick_replies:read' },
  { path: '/settings/tags', icon: Tag, label: 'Tags', permission: 'tags:read' },
  { path: '/settings/custom-fields', icon: Settings, label: 'Custom Fields', permission: 'contact_fields:read' },
  { path: '/settings/events', icon: Workflow, label: 'Events', permission: 'events:read' },
  { path: '/audit', icon: ClipboardList, label: 'Audit Logs', permission: 'audit:read' },
  { divider: true, label: 'Workflow System' },
  { path: '/products', icon: Package, label: 'Products', permission: 'products:read' },
  { path: '/workqueue', icon: ListTodo, label: 'Workqueue', permission: 'workqueue:access' },
  { divider: true, label: 'Admin' },
  { path: '/admin/users', icon: UserCog, label: 'Users', permission: 'admin:users' },
  { path: '/admin/groups', icon: Shield, label: 'Groups', permission: 'rbac:read' },
  { path: '/admin/permissions', icon: Key, label: 'Permissions', permission: 'rbac:read' },
  { path: '/admin/whatsapp-testing', icon: TestTube, label: 'WhatsApp Testing', superadminOnly: true },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const { user, logout, hasPermission, isSuperAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter(item => {
    if (item.divider) return true;
    if (item.superadminOnly) return isSuperAdmin;
    if (!item.permission) return true;
    return isSuperAdmin || hasPermission(item.permission);
  });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center',
        minHeight: 64,
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <MessageSquare size={32} color={theme.palette.primary.main} />
          {open && (
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {config.appName}
            </Typography>
          )}
        </Box>
        {!isMobile && open && (
          <IconButton onClick={handleDrawerCollapse} size="small">
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {filteredNavItems.map((item, index) => {
          if (item.divider) {
            return open ? (
              <Typography 
                key={`divider-${index}`}
                variant="caption" 
                color="text.secondary" 
                sx={{ px: 2, py: 1, display: 'block', mt: 1, fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            ) : <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }

          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                selected={isActive}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '& .lucide': { color: 'inherit' }
                  },
                  '&:hover': {
                    bgcolor: 'background.tertiary',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? 'inherit' : 'text.secondary'
                  }}
                >
                  <item.icon size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none' }} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ borderColor: 'divider' }} />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, justifyContent: open ? 'flex-start' : 'center' }}>
          <Avatar sx={{ 
            bgcolor: isSuperAdmin ? 'warning.main' : 'secondary.main', 
            width: 36, 
            height: 36, 
            fontSize: '0.9rem',
            background: isSuperAdmin 
              ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
              : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {open && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.name}
                {isSuperAdmin && (
                  <Chip label="SA" size="small" color="warning" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem' }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user?.username}
              </Typography>
            </Box>
          )}
        </Box>
        
        <ListItemButton 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2, 
            justifyContent: open ? 'flex-start' : 'center',
            px: open ? 2 : 1,
            color: 'text.secondary',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: 'rgba(255, 107, 107, 0.1)'
            }
          }}
        >
          <LogOut size={20} />
          {open && <Typography sx={{ ml: 1.5, fontSize: '0.9rem' }}>Logout</Typography>}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedDrawerWidth}px` },
          display: { sm: 'none' },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, mb: 0 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="text.primary">
            {config.appName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : collapsedDrawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s' }}
        aria-label="mailbox folders"
      >
        {/* Mobile Temporary Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: open ? drawerWidth : collapsedDrawerWidth,
              transition: 'width 0.2s',
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)` },
          mt: { xs: 7, sm: 0 },
          transition: 'width 0.2s'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
