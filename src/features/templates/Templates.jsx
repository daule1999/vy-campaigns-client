import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Box, Typography, MenuItem, Chip } from '@mui/material';
import { templatesApi } from '../../api';
import { Button, Input, Modal, Table, Card } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wa_template_name: '',
    category: 'UTILITY',
    language_code: 'en',
    body_preview: ''
  });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('templates:write');

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await templatesApi.getAll();
      setTemplates(data.data);
    } catch (error) {
      console.error('Load templates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', wa_template_name: '', category: 'UTILITY', language_code: 'en', body_preview: '' });
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      wa_template_name: template.wa_template_name,
      category: template.category || 'UTILITY',
      language_code: template.language_code || 'en',
      body_preview: template.body_preview || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await templatesApi.update(editingId, formData);
      } else {
        await templatesApi.create(formData);
      }
      setShowModal(false);
      loadTemplates();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await templatesApi.delete(id);
      loadTemplates();
    } catch (error) {
      alert('Failed to delete template');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await templatesApi.sync();
      loadTemplates();
    } catch (error) {
      alert('Failed to sync templates');
    } finally {
      setSyncing(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'WhatsApp Template', accessor: 'wa_template_name' },
    { 
      header: 'Category', 
      accessor: 'category',
      render: (row) => <Chip label={row.category || 'MARKETING'} size="small" color={row.category === 'UTILITY' ? 'info' : 'default'} />
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => {
        const status = (row.status || 'UNKNOWN').toLowerCase();
        const colors = { approved: 'success', pending: 'warning', rejected: 'error', paused: 'error' };
        return <Chip label={status.toUpperCase()} size="small" color={colors[status] || 'default'} />;
      }
    },
    { header: 'Language', accessor: 'language_code' },
    { 
      header: 'Preview', 
      render: (row) => (
        <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>
          {row.body_preview || '-'}
        </Typography>
      )
    },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && <Button variant="ghost" size="small" onClick={() => openEditModal(row)}><Edit size={16} /></Button>}
          {canWrite && <Button variant="ghost" size="small" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></Button>}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your WhatsApp message templates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="secondary" startIcon={<RefreshCw size={18} />} onClick={handleSync} loading={syncing}>
            Sync
          </Button>
          {canWrite && <Button startIcon={<Plus size={18} />} onClick={openAddModal}>Add Template</Button>}
        </Box>
      </Box>

      <Card>
        <Table columns={columns} data={templates} loading={loading} emptyMessage="No templates found" />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Template' : 'Add Template'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Input
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Template"
            required
          />
          <Input
            label="WhatsApp Template Name"
            value={formData.wa_template_name}
            onChange={(e) => setFormData({ ...formData, wa_template_name: e.target.value })}
            placeholder="hello_world"
            required
            helperText="Must match the exact name in WhatsApp Business Manager"
          />
          <Input
            select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            helperText="Select template category"
          >
            {['MARKETING', 'UTILITY', 'AUTHENTICATION'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Input>
          <Input
            select
            label="Language"
            value={formData.language_code}
            onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
            helperText="Select template language"
          >
            {[
              { code: 'en', name: 'English' },
              { code: 'en_US', name: 'English (US)' },
              { code: 'en_GB', name: 'English (UK)' },
              { code: 'hi', name: 'Hindi' },
              { code: 'es', name: 'Spanish' },
              { code: 'pt_BR', name: 'Portuguese (BR)' }
            ].map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {`${option.name} (${option.code})`}
              </MenuItem>
            ))}
          </Input>
          <Input
            label="Body Preview"
            type="textarea"
            value={formData.body_preview}
            onChange={(e) => setFormData({ ...formData, body_preview: e.target.value })}
            placeholder="Preview of your message..."
          />
        </Box>
      </Modal>
    </Box>
  );
}
