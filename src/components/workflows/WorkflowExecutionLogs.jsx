import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { workflowService } from '../../api/services';

const WorkflowExecutionLogs = ({ workflowId, executionId }) => {
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (executionId) {
      loadExecutionLogs();
    }
  }, [workflowId, executionId]);

  const loadExecutionLogs = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getExecutionLogs(workflowId, executionId);
      setExecution(response.data.execution);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error loading execution logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#10B981' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#EF4444' }} />;
      case 'running':
        return <ScheduleIcon sx={{ color: '#F59E0B' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading execution logs...</Typography>
      </Box>
    );
  }

  if (!execution) {
    return (
      <Box p={3}>
        <Typography>No execution data available</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Execution Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Execution Summary</Typography>
            <Chip
              label={execution.status}
              color={getStatusColor(execution.status)}
              icon={getStatusIcon(execution.status)}
            />
          </Box>

          <List>
            <ListItem>
              <ListItemText
                primary="Started At"
                secondary={new Date(execution.startedAt).toLocaleString()}
              />
            </ListItem>
            {execution.completedAt && (
              <ListItem>
                <ListItemText
                  primary="Completed At"
                  secondary={new Date(execution.completedAt).toLocaleString()}
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Contact" secondary={execution.contact?.name} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Current Node"
                secondary={execution.currentNodeId || 'N/A'}
              />
            </ListItem>
          </List>

          {execution.error && (
            <Box mt={2} p={2} bgcolor="#FEE2E2" borderRadius={1}>
              <Typography variant="caption" color="error" display="block">
                Error:
              </Typography>
              <Typography variant="body2" color="error">
                {execution.error}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Execution Logs ({logs.length})
          </Typography>

          {logs.length > 0 ? (
            logs.map((log, index) => (
              <Accordion key={log.id || index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    {getStatusIcon(log.status)}
                    <Box>
                      <Typography variant="body1">
                        Step {index + 1}: {log.nodeType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.executedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Node ID: {log.nodeId}
                    </Typography>

                    {log.input && (
                      <Box mb={2}>
                        <Typography variant="caption" fontWeight="bold">
                          Input:
                        </Typography>
                        <Box bgcolor="#f5f5f5" p={1} borderRadius={1} mt={0.5}>
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(log.input, null, 2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {log.output && (
                      <Box mb={2}>
                        <Typography variant="caption" fontWeight="bold">
                          Output:
                        </Typography>
                        <Box bgcolor="#f5f5f5" p={1} borderRadius={1} mt={0.5}>
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(log.output, null, 2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {log.error && (
                      <Box bgcolor="#FEE2E2" p={1} borderRadius={1}>
                        <Typography variant="caption" color="error" fontWeight="bold" display="block">
                          Error:
                        </Typography>
                        <Typography variant="body2" color="error">
                          {log.error}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No logs available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkflowExecutionLogs;
