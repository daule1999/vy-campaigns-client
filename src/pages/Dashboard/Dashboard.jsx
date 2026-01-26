import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { campaignService, contactService, workflowService } from '../../api/services';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    runningCampaigns: 0,
    totalContacts: 0,
    activeWorkflows: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [campaigns, contacts, workflows] = await Promise.all([
        campaignService.getAll(),
        contactService.getAll({ limit: 1 }),
        workflowService.getAll(),
      ]);

      setStats({
        totalCampaigns: campaigns.data.length,
        runningCampaigns: campaigns.data.filter(c => c.status === 'running').length,
        totalContacts: contacts.data.total || contacts.data.length,
        activeWorkflows: workflows.data.filter(w => w.isActive).length,
      });

      setRecentCampaigns(campaigns.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Campaigns
                  </Typography>
                  <Typography variant="h4">{stats.totalCampaigns}</Typography>
                </Box>
                <CampaignIcon sx={{ fontSize: 48, color: '#3B82F6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Running
                  </Typography>
                  <Typography variant="h4">{stats.runningCampaigns}</Typography>
                </Box>
                <TimelineIcon sx={{ fontSize: 48, color: '#10B981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Contacts
                  </Typography>
                  <Typography variant="h4">{stats.totalContacts}</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: '#F59E0B' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Workflows
                  </Typography>
                  <Typography variant="h4">{stats.activeWorkflows}</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#8B5CF6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Campaigns */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Campaigns</Typography>
                <Button size="small" onClick={() => navigate('/campaigns')}>
                  View All
                </Button>
              </Box>
              <List>
                {recentCampaigns.map((campaign) => (
                  <ListItem
                    key={campaign.id}
                    button
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <ListItemText
                      primary={campaign.name}
                      secondary={
                        <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={
                              campaign.status === 'completed' ? 'success' :
                              campaign.status === 'running' ? 'primary' :
                              'default'
                            }
                          />
                          <Typography variant="caption">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/campaigns/create')}
                    sx={{ py: 2 }}
                  >
                    Create Campaign
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/contacts/create')}
                    sx={{ py: 2 }}
                  >
                    Add Contact
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/workflows/create')}
                    sx={{ py: 2 }}
                  >
                    New Workflow
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/teams')}
                    sx={{ py: 2 }}
                  >
                    Manage Teams
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
