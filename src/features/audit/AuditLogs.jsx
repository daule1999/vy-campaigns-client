import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { auditApi } from '../../api';
import { Table, Card, Badge } from '../../components/common';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const { data } = await auditApi.getAll({ limit: 100 });
      setLogs(data.data);
    } catch (error) {
      console.error('Load audit logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (row) => {
    // Try multiple date field names
    const dateValue = row.created_at || row.createdAt || row.timestamp;
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  const columns = [
    { header: 'User', accessor: 'user_email' },
    { header: 'Action', render: (row) => <Badge variant="info">{row.action}</Badge> },
    { header: 'Entity', render: (row) => row.entity_type || '-' },
    { header: 'Entity ID', render: (row) => row.entity_id || '-' },
    { header: 'IP', accessor: 'ip_address' },
    { header: 'Time', render: (row) => formatDate(row) }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all system actions
        </Typography>
      </Box>

      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No audit logs" />
      </Card>
    </Box>
  );
}
