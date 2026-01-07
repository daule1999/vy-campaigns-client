import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Send, Plus, ArrowRight } from 'lucide-react';
import { 
  Box, 
  Grid, 
  Typography, 
  Stack, 
  IconButton, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton 
} from '@mui/material';
import { dashboardApi } from '../../api';
import { Card, Button, Badge } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, templates: 0, campaigns: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canCreateCampaign = isSuperAdmin || hasPermission('campaigns:write');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await dashboardApi.getStats();
      setStats({
        contacts: data.data.persons || data.data.contacts || 0,
        templates: data.data.templates,
        campaigns: data.data.campaigns,
      });
      setRecentCampaigns(data.data.recentCampaigns || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = { draft: 'default', running: 'warning', completed: 'success', failed: 'error' };
    return variants[status] || 'default';
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <Card.Body className="" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: 3, 
            bgcolor: `${color}.main`, 
            color: 'white',
            bg: `rgba(var(--mui-palette-${color}-mainChannel) / 0.1)`, // Use alpha if mainChannel available, otherwise fallback
            // More robust custom colors for specific stats
            ...(color === 'info' && { bgcolor: 'rgba(79, 140, 255, 0.15)', color: '#4f8cff' }),
            ...(color === 'success' && { bgcolor: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }),
            ...(color === 'warning' && { bgcolor: 'rgba(255, 159, 67, 0.15)', color: '#ff9f43' }),
            display: 'flex'
          }}
        >
          <Icon size={24} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1}>
            {loading ? '-' : value}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {label}
          </Typography>
        </Box>
      </Card.Body>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your WhatsApp campaigns
          </Typography>
        </Box>
        {canCreateCampaign && (
          <Button component={Link} to="/campaigns/new" startIcon={<Plus size={18} />}>
            New Campaign
          </Button>
        )}
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={Users} label="Total Contacts" value={stats.contacts} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={FileText} label="Templates" value={stats.templates} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={Send} label="Campaigns" value={stats.campaigns} color="warning" />
        </Grid>
      </Grid>

      <Card>
        <Card.Header>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6">Recent Campaigns</Typography>
            <Button 
              component={Link} 
              to="/campaigns" 
              variant="text" 
              endIcon={<ArrowRight size={16} />}
              size="small"
            >
              View All
            </Button>
          </Box>
        </Card.Header>
        <Divider />
        <Card.Body sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Loading...</Box>
          ) : recentCampaigns.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" paragraph>No campaigns yet</Typography>
              {canCreateCampaign && (
                <Button component={Link} to="/campaigns/new" variant="outlined">
                  Create your first campaign
                </Button>
              )}
            </Box>
          ) : (
            <List disablePadding>
              {recentCampaigns.map((campaign, index) => (
                <Box key={campaign.id}>
                  {index > 0 && <Divider />}
                  <ListItemButton component={Link} to={`/campaigns/${campaign.id}`} sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {campaign.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {campaign.template_name || 'No template'} • {campaign.total_contacts || 0} contacts
                        </Typography>
                      }
                    />
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </ListItemButton>
                </Box>
              ))}
            </List>
          )}
        </Card.Body>
      </Card>
    </Box>
  );
}
