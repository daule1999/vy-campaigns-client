import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Search, Tag } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Stack, 
  Alert,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { personsApi } from '../../api';
import { Button, Input, Modal, Table, Card, Badge } from '../../components/common';

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phoneNumber: '', 
    phoneCountryCode: '91',
    whatsappNumber: '',
    whatsappCountryCode: '91',
    whatsappSameAsPhone: true,
    email: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await personsApi.getAll({ search: searchQuery, limit: 100 });
      setPersons(data.data);
    } catch (error) {
      console.error('Load persons error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadPersons(e.target.value);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // If same as phone is checked and phone fields change, update whatsapp
      if (prev.whatsappSameAsPhone) {
        if (field === 'phoneNumber') {
          updated.whatsappNumber = value;
        }
        if (field === 'phoneCountryCode') {
          updated.whatsappCountryCode = value;
        }
      }
      return updated;
    });
  };

  const handleSameAsPhoneChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      whatsappSameAsPhone: checked,
      whatsappNumber: checked ? prev.phoneNumber : prev.whatsappNumber,
      whatsappCountryCode: checked ? prev.phoneCountryCode : prev.whatsappCountryCode
    }));
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await personsApi.create(formData);
      setShowAddModal(false);
      setFormData({ 
        firstName: '', 
        lastName: '', 
        phoneNumber: '', 
        phoneCountryCode: '91',
        whatsappNumber: '',
        whatsappCountryCode: '91',
        whatsappSameAsPhone: true,
        email: ''
      });
      loadPersons();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add person');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSaving(true);
    try {
      const { data } = await personsApi.importCsv(file);
      alert(`Imported ${data.data.imported} persons (${data.data.skipped} skipped)`);
      setShowImportModal(false);
      loadPersons();
    } catch (error) {
      alert(error.response?.data?.error || 'Import failed');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this person?')) return;
    try {
      await personsApi.delete(id);
      loadPersons();
    } catch (error) {
      alert('Failed to delete person');
    }
  };

  const columns = [
    { 
      header: 'Name', 
      render: (row) => `${row.firstName} ${row.lastName || ''}`.trim() || row.name || 'N/A'
    },
    { 
      header: 'Phone', 
      render: (row) => `+${row.phoneCountryCode || '91'} ${row.phoneNumber || row.phone || 'N/A'}`
    },
    { 
      header: 'WhatsApp', 
      render: (row) => row.whatsappNumber ? `+${row.whatsappCountryCode || '91'} ${row.whatsappNumber}` : 'Same as phone'
    },
    { header: 'Email', render: (row) => row.email || '-' },
    { 
      header: 'Tags', 
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {row.tags?.slice(0, 2).map((tag, i) => (
            <Chip key={i} label={tag} size="small" variant="outlined" />
          )) || '-'}
        </Stack>
      ) 
    },
    { 
      header: 'Actions', 
      width: '80px',
      render: (row) => (
        <Button variant="ghost" size="small" onClick={() => handleDelete(row._id || row.id)}>
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Persons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your contact database
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="secondary" startIcon={<Upload size={18} />} onClick={() => setShowImportModal(true)}>
            Import
          </Button>
          <Button startIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
            Add Person
          </Button>
        </Stack>
      </Box>

      <Card>
        <Card.Header>
          <Input
            placeholder="Search by name, phone, or email..."
            icon={Search}
            value={search}
            onChange={handleSearch}
            sx={{ maxWidth: 400 }}
          />
        </Card.Header>
        <Table 
          columns={columns} 
          data={persons} 
          loading={loading} 
          emptyMessage="No persons found. Add your first person!" 
        />
      </Card>

      {/* Add Person Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Person"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddPerson} loading={saving}>Add Person</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleAddPerson} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Stack direction="row" spacing={2}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleFormChange('firstName', e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
              fullWidth
            />
          </Stack>
          
          <Typography variant="subtitle2" sx={{ mt: 1, mb: -1 }}>Phone Number</Typography>
          <Stack direction="row" spacing={2}>
            <Input
              label="Country Code"
              value={formData.phoneCountryCode}
              onChange={(e) => handleFormChange('phoneCountryCode', e.target.value)}
              sx={{ width: 100 }}
            />
            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
              required
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.whatsappSameAsPhone}
                onChange={(e) => handleSameAsPhoneChange(e.target.checked)}
              />
            }
            label="WhatsApp number is same as phone"
          />

          {!formData.whatsappSameAsPhone && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: -1 }}>WhatsApp Number</Typography>
              <Stack direction="row" spacing={2}>
                <Input
                  label="Country Code"
                  value={formData.whatsappCountryCode}
                  onChange={(e) => handleFormChange('whatsappCountryCode', e.target.value)}
                  sx={{ width: 100 }}
                />
                <Input
                  label="WhatsApp Number"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleFormChange('whatsappNumber', e.target.value)}
                  fullWidth
                />
              </Stack>
            </>
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
          />
        </Box>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Persons"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            Upload a CSV or Excel file with columns: firstName, lastName, phone/phoneNumber, email
          </Alert>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImport}
            disabled={saving}
          />
          {saving && <Typography color="text.secondary">Importing...</Typography>}
        </Box>
      </Modal>
    </Box>
  );
}
