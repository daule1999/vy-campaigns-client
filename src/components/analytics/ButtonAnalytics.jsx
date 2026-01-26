import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { eventsService } from '../../api/events.service';

const ButtonAnalytics = ({ campaignId, workflowId, startDate, endDate }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [campaignId, workflowId, startDate, endDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (campaignId) params.campaignId = campaignId;
      if (workflowId) params.workflowId = workflowId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await eventsService.getButtonAnalytics(params);
      setAnalytics(response);
    } catch (error) {
      console.error('Error loading button analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUsers = async (button) => {
    setSelectedButton(button);
    setOpenDialog(true);
    setUsersLoading(true);

    try {
      const params = {
        buttonId: button.buttonId,
        buttonName: button.buttonName,
      };
      if (campaignId) params.campaignId = campaignId;
      if (workflowId) params.workflowId = workflowId;

      const response = await eventsService.getButtonUsers(params);
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics) return;

    const csvContent = [
      ['Button Name', 'Button Type', 'Clicks', 'Click %', 'Unique Users'],
      ...analytics.buttons.map(b => [
        b.buttonName,
        b.buttonType,
        b.clicks,
        b.clickPercentage,
        b.uniqueUsers,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'button-analytics.csv';
    a.click();
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress />
      </Box>
    );
  }

  if (!analytics || analytics.buttons.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          No button click data available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Send campaigns with interactive buttons to see analytics here
        </Typography>
      </Box>
    );
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

  const chartData = analytics.buttons.map((button, index) => ({
    name: button.buttonName,
    value: button.clicks,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Clicks
              </Typography>
              <Typography variant="h3">{analytics.totalClicks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Unique Users
              </Typography>
              <Typography variant="h3">{analytics.uniqueUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Click Rate
              </Typography>
              <Typography variant="h3">
                {analytics.totalClicks > 0
                  ? ((analytics.uniqueUsers / analytics.totalClicks) * 100).toFixed(1)
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Click Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${((entry.value / analytics.totalClicks) * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Button Performance Table */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Button Performance</Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  size="small"
                  onClick={handleExport}
                >
                  Export CSV
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Button Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Clicks</TableCell>
                      <TableCell align="right">Click %</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.buttons.map((button, index) => (
                      <TableRow key={index}>
                        <TableCell>{button.buttonName}</TableCell>
                        <TableCell>
                          <Chip label={button.buttonType} size="small" />
                        </TableCell>
                        <TableCell align="right">{button.clicks}</TableCell>
                        <TableCell align="right">{button.clickPercentage}%</TableCell>
                        <TableCell align="right">{button.uniqueUsers}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUsers(button)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Users who clicked: {selectedButton?.buttonName}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {usersLoading ? (
            <LinearProgress />
          ) : (
            <List>
              {users.map((user, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={user.contact?.name || 'Unknown'}
                    secondary={
                      <Box>
                        <Typography variant="body2">{user.contact?.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Clicks: {user.clickCount} | Last: {new Date(user.lastClickedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ButtonAnalytics;
