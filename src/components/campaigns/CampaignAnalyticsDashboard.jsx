import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { campaignAnalyticsService } from '../../api/campaigns.service';
import ButtonAnalytics from '../analytics/ButtonAnalytics';

const STATUS_COLORS = {
  attempted: '#6366F1',
  sent: '#8B5CF6',
  delivered: '#10B981',
  read: '#06B6D4',
  replied: '#F59E0B',
  failed_meta: '#EF4444',
  failed_other: '#F87171',
};

const STATUS_LABELS = {
  attempted: 'Attempted',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  replied: 'Replied',
  failed_meta: 'Limited by Meta',
  failed_other: 'Other Failures',
};

const CampaignAnalyticsDashboard = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [tabValue, setTabValue] = useState(0); // 0 = Overview, 1 = Button Clicks

  useEffect(() => {
    loadAnalytics();
  }, [campaignId]);

  useEffect(() => {
    if (selectedStatus !== 'all') {
      loadUsers(selectedStatus, page, rowsPerPage);
    }
  }, [selectedStatus, page, rowsPerPage]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await campaignAnalyticsService.getAnalytics(campaignId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await campaignAnalyticsService.refreshAnalytics(campaignId);
      await loadAnalytics();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await campaignAnalyticsService.exportReport(campaignId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign_${campaignId}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleRetryFailed = async () => {
    try {
      await campaignAnalyticsService.retryFailed(campaignId);
      await loadAnalytics();
    } catch (error) {
      console.error('Error retrying failed:', error);
    }
  };

  const loadUsers = async (status, page, limit) => {
    try {
      setUsersLoading(true);
      const response = await campaignAnalyticsService.getUsersByStatus(
        campaignId,
        status,
        { page: page + 1, limit }
      );
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return <Alert severity="error">Failed to load analytics</Alert>;
  }

  const { campaign, analytics: stats } = analytics;

  // Prepare chart data
  const chartData = [
    { name: 'Delivered', value: parseInt(stats.delivered.count), color: STATUS_COLORS.delivered },
    { name: 'Read', value: parseInt(stats.read.count), color: STATUS_COLORS.read },
    { name: 'Replied', value: parseInt(stats.replied.count), color: STATUS_COLORS.replied },
    { name: 'Failed (Meta)', value: parseInt(stats.failedMeta.count), color: STATUS_COLORS.failed_meta },
    { name: 'Failed (Other)', value: parseInt(stats.failedOther.count), color: STATUS_COLORS.failed_other },
  ].filter(item => item.value > 0);

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>
            {campaign.name}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Chip label={campaign.status} color="primary" size="small" />
            <Typography variant="body2" color="text.secondary">
              Started: {new Date(campaign.startedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            variant="outlined"
          >
            Download Report
          </Button>
          {parseInt(stats.failedOther.count) > 0 && (
            <Button
              startIcon={<ReplayIcon />}
              onClick={handleRetryFailed}
              variant="contained"
              color="warning"
            >
              Retry Failed
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs for Overview and Button Clicks */}
      <Box mb={3}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Button Clicks" />
        </Tabs>
      </Box>

      {/* Tab Panel: Overview */}
      {tabValue === 0 && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attempted"
            count={stats.attempted.count}
            percentage={stats.attempted.percentage}
            color={STATUS_COLORS.attempted}
            onClick={() => handleStatusClick('attempted')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sent"
            count={stats.sent.count}
            percentage={stats.sent.percentage}
            color={STATUS_COLORS.sent}
            onClick={() => handleStatusClick('sent')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Delivered"
            count={stats.delivered.count}
            percentage={stats.delivered.percentage}
            processing={stats.delivered.processing}
            color={STATUS_COLORS.delivered}
            onClick={() => handleStatusClick('delivered')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Read"
            count={stats.read.count}
            percentage={stats.read.percentage}
            processing={stats.read.processing}
            color={STATUS_COLORS.read}
            onClick={() => handleStatusClick('read')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Replied"
            count={stats.replied.count}
            percentage={stats.replied.percentage}
            processing={stats.replied.processing}
            color={STATUS_COLORS.replied}
            onClick={() => handleStatusClick('replied')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Limited by Meta"
            count={stats.failedMeta.count}
            percentage={stats.failedMeta.percentage}
            color={STATUS_COLORS.failed_meta}
            onClick={() => handleStatusClick('failed_meta')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Other Failures"
            count={stats.failedOther.count}
            percentage={stats.failedOther.percentage}
            color={STATUS_COLORS.failed_other}
            onClick={() => handleStatusClick('failed_other')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4">
                ₹{parseFloat(campaign.totalCost || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹{parseFloat(campaign.costPerMessage || 0).toFixed(4)} per message
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
      )}

      {/* User List */}
      {selectedStatus !== 'all' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Users - {STATUS_LABELS[selectedStatus]}
            </Typography>
            {usersLoading && <LinearProgress />}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contact Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Timestamp</TableCell>
                    {selectedStatus.includes('failed') && <TableCell>Failure Reason</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.contact?.name}</TableCell>
                      <TableCell>{user.contact?.phoneNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          sx={{ backgroundColor: STATUS_COLORS[user.status], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.sentAt && new Date(user.sentAt).toLocaleString()}
                      </TableCell>
                      {selectedStatus.includes('failed') && (
                        <TableCell>
                          <Typography variant="caption" color="error">
                            {user.failureReason}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Tab Panel: Button Clicks */}
      {tabValue === 1 && (
        <ButtonAnalytics campaignId={campaignId} />
      )}
    </Box>
  );
};

// Stat Card Component
const StatCard = ({ title, count, percentage, processing, color, onClick }) => (
  <Card
    sx={{
      cursor: 'pointer',
      '&:hover': { boxShadow: 4 },
      borderLeft: `4px solid ${color}`,
    }}
    onClick={onClick}
  >
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">
        {count}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2" color="text.secondary">
          {percentage}%
        </Typography>
        {processing && (
          <Chip label="Processing..." size="small" color="info" />
        )}
      </Box>
    </CardContent>
  </Card>
);

export default CampaignAnalyticsDashboard;
