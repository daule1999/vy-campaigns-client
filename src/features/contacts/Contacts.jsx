import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Search } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Stack, 
  Alert, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';
import { contactsApi } from '../../api';
import { Button, Input, Modal, Table, Card, Badge } from '../../components/common';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await contactsApi.getAll({ search: searchQuery, limit: 100 });
      setContacts(data.data);
    } catch (error) {
      console.error('Load contacts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadContacts(e.target.value);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contactsApi.create(formData);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', email: '' });
      loadContacts();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSaving(true);
    try {
      const { data } = await contactsApi.importCsv(file);
      alert(`Imported ${data.data.imported} contacts (${data.data.skipped} skipped)`);
      setShowImportModal(false);
      loadContacts();
    } catch (error) {
      alert(error.response?.data?.error || 'Import failed');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await contactsApi.delete(id);
      loadContacts();
    } catch (error) {
      alert('Failed to delete contact');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', render: (row) => row.email || '-' },
    { header: 'Source', render: (row) => (
        <Badge variant="secondary" sx={{ textTransform: 'capitalize' }}>
          {row.source}
        </Badge>
      ) 
    },
    { 
      header: 'Actions', 
      width: '80px',
      render: (row) => (
        <Button variant="ghost" size="small" onClick={() => handleDelete(row.id)}>
          <Trash2 size={16} />
        </Button>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Contacts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your contact list
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button 
            variant="secondary" 
            icon={Upload} 
            onClick={() => setShowImportModal(true)}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
            Import CSV
          </Button>
          <Button 
            startIcon={<Plus size={18} />} 
            onClick={() => setShowAddModal(true)}
            sx={{ flex: { xs: 1, sm: 'initial' } }}
          >
            Add Contact
          </Button>
        </Stack>
      </Box>

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Input
            icon={Search}
            placeholder="Search contacts..."
            value={search}
            onChange={handleSearch}
            sx={{ maxWidth: 400 }}
          />
        </Box>
        <Table columns={columns} data={contacts} loading={loading} emptyMessage="No contacts found" />
      </Card>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Contact"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddContact} loading={saving}>Add Contact</Button>
          </>
        }
      >
        <Stack component="form" spacing={2.5}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Stack>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Contacts"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            Upload a CSV or Excel file with the following columns:
          </Alert>
          <List dense sx={{ bgcolor: 'background.tertiary', borderRadius: 2 }}>
            <ListItem>
              <ListItemText primary="name" secondary="Contact name (Required)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="phone" secondary="Phone number (Required)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="email" secondary="Email (Optional)" />
            </ListItem>
          </List>
          
          <Button
            component="label"
            variant="secondary"
            startIcon={<Upload size={18} />}
            disabled={saving}
          >
            Select File
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
            />
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
