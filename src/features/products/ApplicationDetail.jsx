import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Clock, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';
import { Box, Typography, Chip, Divider, Stack, Paper, CircularProgress, Alert, IconButton } from '@mui/material';
import { applicationsApi } from '../../api';
import { Card, Button } from '../../components/common';

const STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  rejected: 'error',
  cancelled: 'default',
  skipped: 'default',
};

const STEP_ICONS = {
  data_entry: <User size={18} />,
  call: <Phone size={18} />,
  whatsapp: <Play size={18} />,
  automated: <Clock size={18} />,
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const { data } = await applicationsApi.getById(id);
      setApplication(data.data);
    } catch (error) {
      console.error('Load application error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!application) return <Box sx={{ p: 4 }}><Alert severity="error">Application not found</Alert></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>Application #{application.id}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={application.status.toUpperCase()} 
              size="small" 
              color={STATUS_COLORS[application.status] || 'default'} 
            />
            <Typography variant="body2" color="text.secondary">
              Created on {new Date(application.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column: Details */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Card sx={{ mb: 3 }}>
            <Card.Header>Customer Information</Card.Header>
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User color="gray" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography fontWeight={600}>
                      {application.person ? `${application.person.firstName} ${application.person.lastName || ''}`.trim() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone color="gray" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography fontWeight={600}>+{application.person?.phoneCountryCode} {application.person?.phoneNumber}</Typography>
                  </Box>
                </Box>
                {application.person?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Mail color="gray" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography fontWeight={600}>{application.person.email}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>

          <Card>
            <Card.Header>Campaign Details</Card.Header>
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Product</Typography>
              <Typography fontWeight={600} gutterBottom>{application.product?.name}</Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="caption" color="text.secondary">Created By</Typography>
              <Typography fontWeight={600}>{application.creator?.name || 'System'}</Typography>
            </Box>
          </Card>
        </Box>

        {/* Right Column: Workflow Progress */}
        <Box sx={{ flex: 2, minWidth: 400 }}>
          <Card>
            <Card.Header>Workflow Timeline</Card.Header>
            <Box sx={{ p: 2 }}>
              <Stack spacing={0}>
                {application.stepExecutions?.map((exec, idx) => (
                  <Box key={exec.id} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: exec.status === 'completed' ? 'success.light' : exec.status === 'rejected' ? 'error.light' : 'grey.200',
                        color: exec.status === 'completed' ? 'success.main' : exec.status === 'rejected' ? 'error.main' : 'grey.600',
                        zIndex: 1
                      }}>
                        {exec.status === 'completed' ? <CheckCircle size={18} /> : 
                         exec.status === 'rejected' ? <XCircle size={18} /> : 
                         exec.status === 'skipped' ? <AlertCircle size={18} /> :
                         <Clock size={18} />}
                      </Box>
                      {idx < application.stepExecutions.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', my: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, pb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography fontWeight={600}>
                          {exec.step?.name}
                          <Chip 
                            label={exec.status.toUpperCase()} 
                            size="small" 
                            variant="outlined"
                            color={STATUS_COLORS[exec.status] || 'default'}
                            sx={{ ml: 1, fontSize: '10px', height: 18 }} 
                          />
                        </Typography>
                        {exec.completedAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(exec.completedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                      
                      {exec.agent && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Agent: {exec.agent.name}
                        </Typography>
                      )}

                      {exec.status === 'completed' && exec.formData && Object.keys(exec.formData).length > 0 && (
                        <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" fontWeight={700} gutterBottom display="block">SUBMITTED DATA</Typography>
                          <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0.5 }}>
                            {Object.entries(exec.formData).map(([k, v]) => (
                              <Box key={k} sx={{ display: 'contents' }}>
                                <Typography component="dt" variant="caption" color="text.secondary">{k}:</Typography>
                                <Typography component="dd" variant="caption" fontWeight={500}>{String(v)}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      )}

                      {exec.notes && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          " {exec.notes} "
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                
                {application.status === 'pending' && application.currentStep && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}>
                        <Clock size={18} />
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600} color="primary.main">
                        Next: {application.currentStep.name} (Waiting for agent)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

