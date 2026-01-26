import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  People as PeopleIcon,
  AccountTree as WorkflowIcon,
  Shield as ShieldIcon,
  Groups as TeamsIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
  { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
  { text: 'Workflows', icon: <WorkflowIcon />, path: '/workflows' },
  { divider: true },
  { text: 'Roles', icon: <ShieldIcon />, path: '/roles' },
  { text: 'Teams', icon: <TeamsIcon />, path: '/teams' },
  { text: 'Agents', icon: <PersonAddIcon />, path: '/agents' },
  { divider: true },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings/inbox' },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: '#3B82F6', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          WhatsApp Automation
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) =>
          item.divider ? (
            <Divider key={index} sx={{ my: 1 }} />
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3B82F6' }}>
              U
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
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
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#F5F5F5',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;
