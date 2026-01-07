import { useState, useEffect } from 'react';
import { Activity, Server, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Box, Typography, Grid, Paper, LinearProgress } from '@mui/material';
import { queueApi } from '../../api';
import { Card, Button } from '../../components/common';

export default function QueueStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = async () => {
    try {
      const { data } = await queueApi.getStatus();
      setStatus(data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Queue status error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return <LinearProgress />;
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}` }}>
      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${color}20`, color: color }}>
        <Icon size={24} />
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Queue Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring of background message jobs
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'flex-end' }}>
            <Server size={16} />
            <Typography variant="subtitle2" color={status?.connected ? 'success.main' : 'error.main'}>
              {status?.connected ? 'Redis Connected' : 'Redis Disconnected'}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active / Processing" 
            value={status?.active} 
            icon={Activity} 
            color="#2196f3" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Waiting in Queue" 
            value={status?.waiting} 
            icon={Clock} 
            color="#ff9800" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Completed" 
            value={status?.completed} 
            icon={CheckCircle} 
            color="#4caf50" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Failed" 
            value={status?.failed} 
            icon={XCircle} 
            color="#f44336" 
          />
        </Grid>
      </Grid>

      <Card title="Queue Health Info">
        <Typography variant="body2" color="text.secondary" paragraph>
          This dashboard shows the status of the background message processing queue.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={16} color="#2196f3" />
            <Typography variant="body2"><strong>Active:</strong> Messages currently being sent by workers.</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={16} color="#ff9800" />
            <Typography variant="body2"><strong>Waiting:</strong> Messages queued and waiting for a worker.</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={16} color="#4caf50" />
            <Typography variant="body2"><strong>Completed:</strong> Messages successfully processed (sent to WhatsApp API).</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <XCircle size={16} color="#f44336" />
            <Typography variant="body2"><strong>Failed:</strong> Messages that encountered an error during sending.</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button startIcon={<RefreshCw size={18} />} onClick={fetchStatus}>
            Refresh Status
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
