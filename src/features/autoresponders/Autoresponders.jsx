import { useEffect, useState } from 'react';
import { Bot, Plus, Trash2, Edit, Power, MessageCircle } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Stack, 
  CircularProgress, 
  Alert,
  Switch,
  Chip,
  TextField,
  FormControlLabel
} from '@mui/material';
import { autorespondersApi } from '../../api';
import { Button, Modal, Card, Table } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function Autoresponders() {
  const [autoresponders, setAutoresponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    triggerKeywords: '',
    welcomeMessage: '',
    menuOptions: [
      { id: 'images', title: 'Get Images' },
      { id: 'links', title: 'Get Links' },
      { id: 'details', title: 'Get Details' }
    ],
    responses: {
      images: { type: 'image', url: '', caption: '' },
      links: { type: 'link', text: '', url: '' },
      details: { type: 'text', content: '' }
    },
    isActive: true
  });
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canWrite = isSuperAdmin || hasPermission('autoresponders:write');

  useEffect(() => { loadAutoresponders(); }, []);

  const loadAutoresponders = async () => {
    setLoading(true);
    try {
      const { data } = await autorespondersApi.getAll();
      setAutoresponders(data.data || []);
    } catch (error) {
      console.error('Load autoresponders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        triggerKeywords: formData.triggerKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
      };

      if (editing) {
        await autorespondersApi.update(editing.id, payload);
      } else {
        await autorespondersApi.create(payload);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      loadAutoresponders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save autoresponder');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this autoresponder?')) return;
    try {
      await autorespondersApi.delete(id);
      loadAutoresponders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await autorespondersApi.toggle(id);
      loadAutoresponders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to toggle');
    }
  };

  const handleEdit = (ar) => {
    setEditing(ar);
    setFormData({
      name: ar.name,
      triggerKeywords: (ar.triggerKeywords || []).join(', '),
      welcomeMessage: ar.welcomeMessage || '',
      menuOptions: ar.menuOptions || [],
      responses: ar.responses || {},
      isActive: ar.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      triggerKeywords: '',
      welcomeMessage: '',
      menuOptions: [
        { id: 'images', title: 'Get Images' },
        { id: 'links', title: 'Get Links' },
        { id: 'details', title: 'Get Details' }
      ],
      responses: {
        images: { type: 'image', url: '', caption: '' },
        links: { type: 'link', text: '', url: '' },
        details: { type: 'text', content: '' }
      },
      isActive: true
    });
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Keywords', 
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(row.triggerKeywords || []).slice(0, 3).map((k, i) => (
            <Chip key={i} label={k} size="small" />
          ))}
          {(row.triggerKeywords || []).length > 3 && <Chip label={`+${row.triggerKeywords.length - 3}`} size="small" />}
        </Stack>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <Chip 
          label={row.isActive ? 'Active' : 'Inactive'} 
          color={row.isActive ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      header: 'Actions',
      width: '150px',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {canWrite && (
            <Button variant="ghost" size="small" onClick={() => handleToggle(row.id)}>
              <Power size={16} />
            </Button>
          )}
          {canWrite && (
            <Button variant="ghost" size="small" onClick={() => handleEdit(row)}>
              <Edit size={16} />
            </Button>
          )}
          {canWrite && (
            <Button variant="ghost" size="small" onClick={() => handleDelete(row.id)}>
              <Trash2 size={16} />
            </Button>
          )}
        </Stack>
      )
    }
  ];

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Bot size={28} />
          <Typography variant="h5">Autoresponders</Typography>
        </Stack>
        {canWrite && (
          <Button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
            <Plus size={18} /> New Autoresponder
          </Button>
        )}
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Autoresponders automatically reply when users send specific keywords (like "Hi" or "Help").
        Configure menu options to provide interactive responses.
      </Alert>

      {autoresponders.length === 0 ? (
        <Card>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography color="textSecondary">No autoresponders configured</Typography>
            {canWrite && <Button sx={{ mt: 2 }} onClick={() => setShowModal(true)}>Create Your First Autoresponder</Button>}
          </Box>
        </Card>
      ) : (
        <Card>
          <Table columns={columns} data={autoresponders} />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Autoresponder' : 'Create Autoresponder'}
        size="large"
        footer={
          <Stack direction="row" spacing={2}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Welcome Bot"
            fullWidth
          />
          
          <TextField
            label="Trigger Keywords (comma-separated)"
            value={formData.triggerKeywords}
            onChange={(e) => setFormData({...formData, triggerKeywords: e.target.value})}
            placeholder="hi, hello, help"
            helperText="Keywords that trigger this autoresponder"
            fullWidth
          />
          
          <TextField
            label="Welcome Message"
            value={formData.welcomeMessage}
            onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
            placeholder="Hello! How can I help you today?"
            multiline
            rows={3}
            fullWidth
          />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Response Configuration</Typography>
          
          <TextField
            label="Images Response - Image URL"
            value={formData.responses?.images?.url || ''}
            onChange={(e) => setFormData({
              ...formData, 
              responses: {...formData.responses, images: {...formData.responses.images, url: e.target.value}}
            })}
            placeholder="https://example.com/image.jpg"
            fullWidth
            size="small"
          />

          <TextField
            label="Links Response - URL"
            value={formData.responses?.links?.url || ''}
            onChange={(e) => setFormData({
              ...formData, 
              responses: {...formData.responses, links: {...formData.responses.links, url: e.target.value}}
            })}
            placeholder="https://example.com"
            fullWidth
            size="small"
          />

          <TextField
            label="Details Response - Message"
            value={formData.responses?.details?.content || ''}
            onChange={(e) => setFormData({
              ...formData, 
              responses: {...formData.responses, details: {...formData.responses.details, content: e.target.value}}
            })}
            placeholder="Here are the details..."
            multiline
            rows={3}
            fullWidth
            size="small"
          />

          <FormControlLabel
            control={
              <Switch 
                checked={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
            }
            label="Active"
          />
        </Stack>
      </Modal>
    </Box>
  );
}
