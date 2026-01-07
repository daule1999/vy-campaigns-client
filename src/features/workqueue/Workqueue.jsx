import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Phone, MessageCircle, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';
import { Box, Typography, Chip, Paper, Alert, Divider, TextField, IconButton } from '@mui/material';
import { applicationsApi, rbacApi } from '../../api';
import { Button, Card, Modal, Input } from '../../components/common';
import useAuthStore from '../../store/authStore';

const STEP_TYPE_ICONS = {
  data_entry: <User size={18} />,
  call: <Phone size={18} />,
  whatsapp: <MessageCircle size={18} />,
  approval: <CheckCircle size={18} />,
  automated: <Play size={18} />,
};

export default function Workqueue() {
  const navigate = useNavigate();
  const [workqueue, setWorkqueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [reassigningItem, setReassigningItem] = useState(null);
  
  const { user, hasPermission, isSuperAdmin } = useAuthStore();
  const canAccess = isSuperAdmin || hasPermission('workqueue:access');
  const canClaim = isSuperAdmin || hasPermission('workqueue:claim');

  useEffect(() => {
    if (canAccess) loadWorkqueue();
  }, [canAccess]);

  const loadWorkqueue = async () => {
    setLoading(true);
    try {
      const { data } = await applicationsApi.getWorkqueue();
      setWorkqueue(data.data || []);
      
      // Update active item if it exists in the new list
      if (activeItem) {
        const updated = (data.data || []).find(i => i.id === activeItem.id);
        if (updated) setActiveItem(updated);
      }
    } catch (error) {
      console.error('Load workqueue error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setActiveItem(item);
    setFormData({});
    setNotes('');
  };

  const handleClaim = async (execution) => {
    try {
      await applicationsApi.claim(execution.applicationId, execution.id);
      loadWorkqueue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to claim');
    }
  };

  const handleRelease = async () => {
    if (!activeItem) return;
    try {
      await applicationsApi.release(activeItem.applicationId, activeItem.id);
      setActiveItem(null);
      loadWorkqueue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to release');
    }
  };

  const handleSubmit = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      await applicationsApi.submitStep(
        activeItem.applicationId,
        activeItem.stepId,
        { executionId: activeItem.id, formData, notes }
      );
      setActiveItem(null);
      loadWorkqueue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!activeItem) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    setSubmitting(true);
    try {
      await applicationsApi.rejectStep(
        activeItem.applicationId,
        activeItem.stepId,
        { executionId: activeItem.id, reason }
      );
      setActiveItem(null);
      loadWorkqueue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReassign = async (item) => {
    setReassigningItem(item);
    setShowReassignModal(true);
    try {
      const { data } = await rbacApi.getGroupMembers(item.step.assignedGroupId);
      setGroupMembers(data.data || []);
    } catch (error) {
      console.error('Load group members error:', error);
    }
  };

  const handleReassign = async () => {
    if (!reassigningItem || !selectedMemberId) return;
    try {
      await applicationsApi.reassign(
        reassigningItem.applicationId, 
        reassigningItem.id, 
        selectedMemberId === 'none' ? null : parseInt(selectedMemberId)
      );
      setShowReassignModal(false);
      setReassigningItem(null);
      setSelectedMemberId('');
      if (activeItem && activeItem.id === reassigningItem.id) {
        setActiveItem(null);
      }
      loadWorkqueue();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reassign');
    }
  };

  const renderFormField = (field, index) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <TextField
            key={index}
            fullWidth
            multiline
            rows={3}
            label={field.label || field.name}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
            size="small"
            sx={{ mb: 2 }}
          />
        );
      case 'boolean':
        return (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>{field.label || field.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant={value === true ? 'primary' : 'secondary'}
                onClick={() => setFormData({ ...formData, [field.name]: true })}
              >
                Yes
              </Button>
              <Button 
                size="small" 
                variant={value === false ? 'primary' : 'secondary'}
                onClick={() => setFormData({ ...formData, [field.name]: false })}
              >
                No
              </Button>
            </Box>
          </Box>
        );
      case 'select':
        return (
          <TextField
            key={index}
            select
            fullWidth
            label={field.label || field.name}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
            size="small"
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="">-- Select --</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </TextField>
        );
      default:
        return (
          <TextField
            key={index}
            fullWidth
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            label={field.label || field.name}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
            size="small"
            sx={{ mb: 2 }}
            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
          />
        );
    }
  };

  if (!canAccess) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">You don't have permission to access the workqueue.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 120px)' }}>
      {/* Workqueue List */}
      <Card sx={{ width: 400, overflow: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">My Workqueue</Typography>
          <Button size="small" variant="ghost" onClick={loadWorkqueue}>
            <RefreshCw size={16} />
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>
        ) : workqueue.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography>No pending items</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 1 }}>
            {workqueue.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  bgcolor: activeItem?.id === item.id ? 'action.selected' : 'background.default',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSelectItem(item)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {STEP_TYPE_ICONS[item.step?.type] || <Play size={18} />}
                  <Typography fontWeight={600} sx={{ flex: 1 }}>{item.step?.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={item.status} size="small" />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenReassign(item); }}>
                      <User size={14} />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2">
                  {item.application?.person ? `${item.application.person.firstName} ${item.application.person.lastName || ''}`.trim() : 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.application?.product?.name} • {item.application?.person?.phone || item.application?.person?.phoneNumber}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Card>

      {/* Work Panel */}
      <Card sx={{ flex: 1, overflow: 'auto' }}>
        {!activeItem ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Play size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6">Select an item to work on</Typography>
            <Typography>Click on an item from your workqueue to start</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700}>{activeItem.step?.name}</Typography>
                <Typography color="text.secondary">
                  {activeItem.application?.product?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeItem.assignedTo === user?.id ? (
                  <>
                    <Button variant="secondary" size="small" onClick={() => handleOpenReassign(activeItem)}>
                      Assign to Others
                    </Button>
                    <Button variant="secondary" size="small" onClick={handleRelease}>
                      Release
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="small" onClick={() => handleClaim(activeItem)}>
                      Assign to Me
                    </Button>
                    <Button variant="secondary" size="small" onClick={() => handleOpenReassign(activeItem)}>
                      Assign to Others
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Person Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
              <Typography fontWeight={600}>
                {activeItem.application?.person ? `${activeItem.application.person.firstName} ${activeItem.application.person.lastName || ''}`.trim() : 'Unknown'}
              </Typography>
              <Typography variant="body2">📞 {activeItem.application?.person?.phone || activeItem.application?.person?.phoneNumber}</Typography>
              {activeItem.application?.person?.email && (
                <Typography variant="body2">✉️ {activeItem.application?.person?.email}</Typography>
              )}
            </Paper>

            {/* Previous Data */}
            {activeItem.application?.stepExecutions?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Previous Activity</Typography>
                {activeItem.application.stepExecutions.map((prev, idx) => (
                  <Paper key={prev.id} variant="outlined" sx={{ p: 1.5, mb: 1, bgcolor: 'action.hover' }}>
                    <Typography variant="caption" fontWeight={700} display="block" gutterBottom>
                      {prev.step?.name} (Completed)
                    </Typography>
                    {prev.formData && Object.keys(prev.formData).length > 0 ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0.5 }}>
                        {Object.entries(prev.formData).map(([k, v]) => (
                          <Box key={k} sx={{ display: 'contents' }}>
                            <Typography variant="caption" color="text.secondary">{k}:</Typography>
                            <Typography variant="caption" fontWeight={500}>{String(v)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No data submitted</Typography>
                    )}
                    {prev.notes && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        Note: {prev.notes}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            )}

            {activeItem.assignedTo === user?.id ? (
              <>
                {/* Form Fields */}
                <Typography variant="subtitle2" gutterBottom>Step Form</Typography>
                {activeItem.step?.formSchema?.fields?.length > 0 ? (
                  activeItem.step.formSchema.fields.map((field, i) => renderFormField(field, i))
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>No form fields for this step.</Alert>
                )}
              </>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                This item is not assigned to you. Click <strong>Assign to Me</strong> to start working on it.
              </Alert>
            )}

            {activeItem.assignedTo === user?.id && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  size="small"
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="secondary" 
                    startIcon={<XCircle size={18} />}
                    onClick={handleReject}
                    loading={submitting}
                  >
                    Reject
                  </Button>
                  <Button 
                    startIcon={<CheckCircle size={18} />}
                    onClick={handleSubmit}
                    loading={submitting}
                    sx={{ flex: 1 }}
                  >
                    Complete Step
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Card>

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Workflow Step"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReassignModal(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={!selectedMemberId}>Reassign</Button>
          </>
        }
      >
        <Typography variant="body2" gutterBottom>
          Assign this step to another member of the <strong>{reassigningItem?.step?.assignedGroup?.name || 'group'}</strong>.
        </Typography>
        <Input
          select
          label="Select Member"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          SelectProps={{ native: true }}
          fullWidth
          sx={{ mt: 2 }}
        >
          <option value="">-- Select Member --</option>
          <option value="none">Set to Unassigned</option>
          {groupMembers.map(member => (
            <option key={member.id} value={member.id}>{member.name} (@{member.username})</option>
          ))}
        </Input>
      </Modal>
    </Box>
  );
}
