import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import { campaignsApi } from '../../api';
import { Button, Badge, Table, Card } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('campaigns:write');

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await campaignsApi.getAll();
      setCampaigns(data.data);
    } catch (error) {
      console.error('Load campaigns error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this campaign?')) return;
    try {
      await campaignsApi.delete(id);
      loadCampaigns();
    } catch (error) {
      alert('Failed to delete campaign');
    }
  };

  const getStatusVariant = (status) => {
    const map = { draft: 'default', scheduled: 'info', running: 'warning', completed: 'success', failed: 'error' };
    return map[status] || 'default';
  };

  const columns = [
    { 
      header: 'Campaign Name', 
      render: (row) => (
        <Typography 
          component={Link} 
          to={`/campaigns/${row.id}`} 
          color="primary" 
          sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
        >
          {row.name}
        </Typography>
      ) 
    },
    { header: 'Template', render: (row) => row.template_name || '-' },
    { header: 'Contacts', render: (row) => row.total_contacts || 0 },
    { header: 'Sent', render: (row) => row.sent_count || 0 },
    { header: 'Failed', render: (row) => row.failed_count || 0 },
    { header: 'Status', render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button variant="ghost" size="small" onClick={() => navigate(`/campaigns/${row.id}`)}><Eye size={16} /></Button>
          {canWrite && <Button variant="ghost" size="small" onClick={(e) => handleDelete(row.id, e)}><Trash2 size={16} /></Button>}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your messaging campaigns
          </Typography>
        </Box>
        {canWrite && (
          <Button component={Link} to="/campaigns/new" startIcon={<Plus size={18} />}>
            New Campaign
          </Button>
        )}
      </Box>

      <Card>
        <Table columns={columns} data={campaigns} loading={loading} emptyMessage="No campaigns yet" />
      </Card>
    </Box>
  );
}
