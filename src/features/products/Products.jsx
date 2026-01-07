import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Settings, Users, Play } from 'lucide-react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { productsApi } from '../../api';
import { Button, Table, Card, Modal, Input } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('products:write');
  const canDelete = isSuperAdmin || hasPermission('products:delete');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.getAll({ includeWorkflow: 'true' });
      setProducts(data.data || []);
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, description: product.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await productsApi.update(editingId, formData);
      } else {
        await productsApi.create(formData);
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This will also delete all workflows and applications.')) return;
    try {
      await productsApi.delete(id);
      loadProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const columns = [
    { 
      header: 'Product Name', 
      render: (row) => (
        <Box>
          <Typography fontWeight={600}>{row.name}</Typography>
          {row.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {row.description}
            </Typography>
          )}
        </Box>
      )
    },
    { 
      header: 'Workflow Steps', 
      render: (row) => {
        const stepCount = row.workflow?.steps?.length || 0;
        return (
          <Chip 
            label={`${stepCount} step${stepCount !== 1 ? 's' : ''}`}
            size="small"
            color={stepCount > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
        );
      }
    },
    { 
      header: 'Status', 
      render: (row) => (
        <Chip 
          label={row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={row.isActive ? 'success' : 'default'}
        />
      )
    },
    {
      header: 'Actions',
      width: '200px',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Configure Workflow">
            <IconButton size="small" onClick={() => navigate(`/products/${row.id}/workflow`)}>
              <Settings size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Applications">
            <IconButton size="small" onClick={() => navigate(`/products/${row.id}/applications`)}>
              <Users size={18} />
            </IconButton>
          </Tooltip>
          {canWrite && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEditModal(row)}>
                <Edit size={18} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(row.id)}>
                <Trash2 size={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Campaign Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage workflow-based campaign products
          </Typography>
        </Box>
        {canWrite && (
          <Button startIcon={<Plus size={18} />} onClick={openAddModal}>
            New Product
          </Button>
        )}
      </Box>

      <Card>
        <Table 
          columns={columns} 
          data={products} 
          loading={loading} 
          emptyMessage="No products created yet. Create your first campaign product to get started."
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Product' : 'Create Product'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Customer Onboarding"
            required
          />
          <Input
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose of this campaign product..."
          />
        </Box>
      </Modal>
    </Box>
  );
}
