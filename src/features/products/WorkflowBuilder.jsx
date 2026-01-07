import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, GripVertical, ArrowLeft, Users, FileText } from 'lucide-react';
import { 
  Box, Typography, Chip, IconButton, Tooltip, Paper, 
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { productsApi, rbacApi } from '../../api';
import { Button, Card, Modal, Input } from '../../components/common';
import useAuthStore from '../../store/authStore';

const STEP_TYPES = [
  { value: 'data_entry', label: 'Data Entry', color: 'info' },
  { value: 'call', label: 'Call', color: 'warning' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'success' },
  { value: 'approval', label: 'Approval', color: 'secondary' },
  { value: 'automated', label: 'Automated', color: 'default' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'boolean', label: 'Yes/No Toggle' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
];

export default function WorkflowBuilder() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [steps, setSteps] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({
    name: '',
    type: 'data_entry',
    assignedGroupId: '',
    formSchema: { fields: [] },
  });
  const [saving, setSaving] = useState(false);
  
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('products:write');

  useEffect(() => {
    loadProduct();
    loadGroups();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.getById(productId);
      setProduct(data.data);
      setSteps(data.data?.workflow?.steps || []);
    } catch (error) {
      console.error('Load product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const { data } = await rbacApi.getGroups();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Load groups error:', error);
    }
  };

  const openAddStep = () => {
    setEditingStep(null);
    setStepForm({
      name: '',
      type: 'data_entry',
      assignedGroupId: '',
      formSchema: { fields: [] },
    });
    setShowStepModal(true);
  };

  const openEditStep = (step) => {
    setEditingStep(step);
    setStepForm({
      name: step.name,
      type: step.type,
      assignedGroupId: step.assignedGroupId || '',
      formSchema: step.formSchema || { fields: [] },
    });
    setShowStepModal(true);
  };

  const handleSaveStep = async () => {
    if (!stepForm.name.trim()) {
      alert('Step name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingStep) {
        await productsApi.updateStep(editingStep.id, stepForm);
      } else {
        await productsApi.addStep(productId, stepForm);
      }
      setShowStepModal(false);
      loadProduct();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!confirm('Delete this step?')) return;
    try {
      await productsApi.deleteStep(stepId);
      loadProduct();
    } catch (error) {
      alert('Failed to delete step');
    }
  };

  // Form field management
  const addFormField = () => {
    setStepForm(prev => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: [...prev.formSchema.fields, {
          name: '',
          type: 'text',
          label: '',
          required: false,
          options: []
        }]
      }
    }));
  };

  const updateFormField = (index, field, value) => {
    setStepForm(prev => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: prev.formSchema.fields.map((f, i) => 
          i === index ? { ...f, [field]: value } : f
        )
      }
    }));
  };

  const removeFormField = (index) => {
    setStepForm(prev => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: prev.formSchema.fields.filter((_, i) => i !== index)
      }
    }));
  };

  const getStepTypeChip = (type) => {
    const config = STEP_TYPES.find(t => t.value === type) || STEP_TYPES[0];
    return <Chip label={config.label} size="small" color={config.color} />;
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>;
  }

  if (!product) {
    return <Box sx={{ p: 4 }}><Alert severity="error">Product not found</Alert></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/products')}>
          <ArrowLeft />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>{product.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Workflow Builder - Configure steps and forms
          </Typography>
        </Box>
        <Button 
          variant="secondary" 
          startIcon={<Users size={18} />}
          onClick={() => navigate(`/products/${productId}/applications`)}
        >
          Applications
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Create workflow steps to define how applications are processed. Each step can have a form for agents to fill.
      </Alert>

      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Workflow Steps</Typography>
          {canWrite && (
            <Button size="small" startIcon={<Plus size={16} />} onClick={openAddStep}>
              Add Step
            </Button>
          )}
        </Box>
        
        {steps.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography>No steps configured. Add your first workflow step.</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {steps.sort((a, b) => a.order - b.order).map((step, index) => (
              <Paper 
                key={step.id} 
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  bgcolor: 'background.default'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 40 }}>
                  <GripVertical size={18} style={{ opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary">{step.order}</Typography>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{step.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {getStepTypeChip(step.type)}
                    {step.assignedGroup && (
                      <Chip 
                        label={step.assignedGroup.name} 
                        size="small" 
                        variant="outlined"
                        icon={<Users size={12} />}
                      />
                    )}
                    <Chip 
                      label={`${step.formSchema?.fields?.length || 0} fields`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {canWrite && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit Step">
                      <IconButton size="small" onClick={() => openEditStep(step)}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Step">
                      <IconButton size="small" onClick={() => handleDeleteStep(step.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Card>

      {/* Step Modal */}
      <Modal
        isOpen={showStepModal}
        onClose={() => setShowStepModal(false)}
        title={editingStep ? 'Edit Step' : 'Add Step'}
        size="large"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStepModal(false)}>Cancel</Button>
            <Button onClick={handleSaveStep} loading={saving}>
              {editingStep ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Input
            label="Step Name"
            value={stepForm.name}
            onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
            placeholder="e.g., Call Verification"
            required
          />

          <FormControl fullWidth size="small">
            <InputLabel>Step Type</InputLabel>
            <Select
              value={stepForm.type}
              label="Step Type"
              onChange={(e) => setStepForm({ ...stepForm, type: e.target.value })}
            >
              {STEP_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Assigned Group</InputLabel>
            <Select
              value={stepForm.assignedGroupId}
              label="Assigned Group"
              onChange={(e) => setStepForm({ ...stepForm, assignedGroupId: e.target.value })}
            >
              <MenuItem value="">-- None --</MenuItem>
              {groups.map(group => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Form Fields</Typography>
              <Button size="small" variant="secondary" onClick={addFormField}>
                <Plus size={14} /> Add Field
              </Button>
            </Box>

            {stepForm.formSchema.fields.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                No form fields. Add fields for agents to fill during this step.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stepForm.formSchema.fields.map((field, index) => (
                  <Paper key={index} sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Input
                      size="small"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateFormField(index, 'name', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Input
                      size="small"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => updateFormField(index, 'label', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Select
                      size="small"
                      value={field.type}
                      onChange={(e) => updateFormField(index, 'type', e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      {FIELD_TYPES.map(t => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </Select>
                    <IconButton size="small" onClick={() => removeFormField(index)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
