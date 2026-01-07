import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import { ChevronDown, ChevronRight, AlertCircle, X } from 'lucide-react';
import { campaignsApi } from '../../api';

export default function CampaignErrors({ campaignId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadErrors();
  }, [campaignId]);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const { data } = await campaignsApi.getErrors(campaignId);
      setLogs(data.data || []);
    } catch (error) {
      console.error('Load errors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  if (logs.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="success">No errors recorded for this campaign.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <>
                <TableRow 
                  key={log.id} 
                  hover 
                  onClick={() => toggleExpand(log.id)} 
                  sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' }, bgcolor: expandedId === log.id ? 'action.hover' : 'inherit' }}
                >
                  <TableCell>
                    <IconButton size="small">
                      {expandedId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>{log.metadata?.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error" fontWeight="bold">
                      {log.errorCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.errorMessage}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedId === log.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AlertCircle size={16} /> Error Details
                        </Typography>
                        <Box 
                          component="pre" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            overflow: 'auto', 
                            maxHeight: 300,
                            m: 0,
                            fontFamily: 'monospace'
                          }}
                        >
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(log.errorDetails), null, 2);
                            } catch (e) {
                              return log.errorDetails || 'No details available';
                            }
                          })()}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
