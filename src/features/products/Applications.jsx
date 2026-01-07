import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Upload, ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { Box, Typography, Chip, IconButton, Tooltip, Alert } from '@mui/material';
import { productsApi, personsApi, rbacApi } from '../../api';
import { Button, Table, Card, Modal, Input } from '../../components/common';
import useAuthStore from '../../store/authStore';

const STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  rejected: 'error',
  cancelled: 'default',
};

export default function Applications() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [persons, setPersons] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [workflowMembers, setWorkflowMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('applications:write');
  const canImport = isSuperAdmin || hasPermission('applications:import');

  useEffect(() => {
    loadProduct();
    loadApplications();
    loadPersons();
    loadWorkflowMembers();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const { data } = await productsApi.getById(productId);
      setProduct(data.data);
    } catch (error) {
      console.error('Load product error:', error);
    }
  };

  const loadApplications = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await productsApi.getApplications(productId, { page, limit: pagination.limit });
      setApplications(data.data || []);
      setPagination(prev => ({ ...prev, page, total: data.total || 0 }));
    } catch (error) {
      console.error('Load applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersons = async () => {
    try {
      const { data } = await personsApi.getAll({ limit: 100 });
      setPersons(data.data || []);
    } catch (error) {
      console.error('Load persons error:', error);
    }
  };

  const loadWorkflowMembers = async () => {
    try {
      const { data: workflowData } = await productsApi.getWorkflow(productId);
      const steps = workflowData.data || [];
      if (steps.length > 0 && steps[0].assignedGroupId) {
        const { data: membersData } = await rbacApi.getGroupMembers(steps[0].assignedGroupId);
        setWorkflowMembers(membersData.data || []);
      }
    } catch (error) {
      console.error('Load workflow members error:', error);
    }
  };

  const handleCreate = async () => {
    if (!selectedPersonId) {
      alert('Please select a person');
      return;
    }
    setSaving(true);
    try {
      await productsApi.createApplication(productId, { 
        personId: parseInt(selectedPersonId),
        assignedTo: assignedTo ? parseInt(assignedTo) : null
      });
      setShowAddModal(false);
      setSelectedPersonId('');
      setAssignedTo('');
      loadApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create application');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a CSV file');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('createPersons', 'true');
      
      const { data } = await productsApi.importApplications(productId, formData);
      alert(`Imported ${data.data.imported} applications. ${data.data.errors} errors.`);
      setShowImportModal(false);
      setImportFile(null);
      loadApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to import');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { 
      header: 'Person', 
      render: (row) => (
        <Box>
          <Typography fontWeight={500}>
            {row.person ? `${row.person.firstName} ${row.person.lastName || ''}`.trim() : 'Unknown'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.person?.phone || row.person?.phoneNumber}
          </Typography>
        </Box>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <Chip 
          label={row.status.replace('_', ' ').toUpperCase()}
          size="small"
          color={STATUS_COLORS[row.status] || 'default'}
        />
      )
    },
    { 
      header: 'Current Step', 
      render: (row) => (
        row.currentStep ? (
          <Chip 
            label={`${row.currentStep.order}. ${row.currentStep.name}`}
            size="small"
            variant="outlined"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">--</Typography>
        )
      )
    },
    { 
      header: 'Created', 
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => navigate(`/applications/${row.id}`)}>
            <Eye size={18} />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/products')}>
          <ArrowLeft />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {product?.name || 'Product'} Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.total} total applications
          </Typography>
        </Box>
        <Button variant="secondary" onClick={() => loadApplications()} startIcon={<RefreshCw size={16} />}>
          Refresh
        </Button>
        {canImport && (
          <Button variant="secondary" onClick={() => setShowImportModal(true)} startIcon={<Upload size={16} />}>
            Import CSV
          </Button>
        )}
        {canWrite && (
          <Button onClick={() => setShowAddModal(true)} startIcon={<Plus size={16} />}>
            Add Application
          </Button>
        )}
      </Box>

      <Card>
        <Table 
          columns={columns} 
          data={applications} 
          loading={loading} 
          emptyMessage="No applications yet. Create or import applications to start."
        />
      </Card>

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Application"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </>
        }
      >
        <Input
          select
          label="Select Person"
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          SelectProps={{ native: true }}
        >
          <option value="">-- Select a person --</option>
          {persons.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
          ))}
        </Input>

        <Input
          select
          label="Assign To (Optional)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ mt: 2 }}
        >
          <option value="">-- No Assignment (Self-claim later) --</option>
          {workflowMembers.map(m => (
            <option key={m.id} value={m.id}>{m.name} (@{m.username})</option>
          ))}
        </Input>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Applications from CSV"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
            <Button onClick={handleImport} loading={saving}>Import</Button>
          </>
        }
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          CSV should have columns: name, phone, email (optional). New persons will be created automatically.
        </Alert>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setImportFile(e.target.files[0])}
          style={{ width: '100%' }}
        />
      </Modal>
    </Box>
  );
}
