import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Plus, Trash2, Users, ArrowLeft, Upload, AlertTriangle, MessageSquare, AlertCircle } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Stack, 
  Grid, 
  CircularProgress, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import { campaignsApi, personsApi } from '../../api';
import { Button, Badge, Modal, Card, Table, SearchableSelect } from '../../components/common';
import CampaignErrors from './CampaignErrors';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddContacts, setShowAddContacts] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sending, setSending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, name: '', error: '' });

  useEffect(() => { loadCampaign(); }, [id]);

  const loadCampaign = async () => {
    setLoading(true);
    try {
      const { data } = await campaignsApi.getById(id);
      setCampaign(data.data);
    } catch (error) {
      console.error('Load campaign error:', error);
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const openAddContactsModal = async () => {
    setShowAddContacts(true);
    setContactsLoading(true);
    setSelectedContacts([]);
    try {
      const { data } = await personsApi.getAll({ limit: 500 });
      const existingIds = new Set(campaign.contacts?.map(c => c.contact_id) || []);
      // Transform data to match UI expected format
      const transformedPersons = data.data
        .filter(p => !existingIds.has(p.id))
        .map(p => ({
          ...p,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          phone: `+${p.phoneCountryCode || '91'}${p.phoneNumber}`
        }));
      setAllContacts(transformedPersons);
    } catch (error) {
      console.error('Load contacts error:', error);
      setAllContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleAddContacts = async () => {
    if (selectedContacts.length === 0) return;
    try {
      await campaignsApi.addContacts(id, selectedContacts);
      setShowAddContacts(false);
      loadCampaign();
    } catch (error) {
      console.error('Add contacts error:', error);
      alert(error.response?.data?.error || 'Failed to add contacts');
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const importResult = await personsApi.importCsv(file);
      const { imported, skipped } = importResult.data.data;
      
      const { data } = await personsApi.getAll({ limit: 500 });
      const existingIds = new Set(campaign.contacts?.map(c => c.contact_id) || []);
      const newContacts = data.data.filter(c => !existingIds.has(c.id));
      
      if (newContacts.length > 0) {
        await campaignsApi.addContacts(id, newContacts.map(c => c.id));
      }
      
      alert(`Imported ${imported} contacts (${skipped} skipped). Added ${newContacts.length} to campaign.`);
      loadCampaign();
    } catch (error) {
      console.error('CSV import error:', error);
      alert(error.response?.data?.error || 'Failed to import CSV');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (!confirm('Remove this contact?')) return;
    try {
      await campaignsApi.removeContacts(id, [contactId]);
      loadCampaign();
    } catch (error) {
      alert('Failed to remove contact');
    }
  };

  const openSendConfirmation = () => {
    if (!campaign.templateId && !campaign.template_id) {
      alert('Please select a template first');
      return;
    }
    if ((campaign.contacts?.length || 0) === 0) {
      alert('Please add persons first');
      return;
    }
    setShowSendConfirm(true);
  };

  const handleSend = async () => {
    setShowSendConfirm(false);
    setSending(true);
    try {
      const { data } = await campaignsApi.send(id);
      alert(`Sent: ${data.data.sent}, Failed: ${data.data.failed}`);
      loadCampaign();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const getStatusVariant = (status) => {
    const map = { pending: 'default', sent: 'success', delivered: 'success', read: 'info', failed: 'error' };
    return map[status] || 'default';
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!campaign) return null;

  const personColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> },
    { 
       header: 'Error', 
       accessor: 'error', 
       render: (row) => row.error ? (
         <Box 
           sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} 
           onClick={() => setErrorDialog({ open: true, name: row.name, error: row.error })}
         >
           <Typography variant="caption" color="error">{row.error?.substring(0, 30)}...</Typography>
         </Box>
       ) : '-' 
    },
    { 
      header: '', 
      width: '60px',
      render: (row) => campaign.status === 'draft' && (
        <Button variant="ghost" size="small" onClick={() => handleRemoveContact(row.contact_id)}>
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  const InfoCard = ({ label, value, color }) => (
    <Card sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>{label}</Typography>
      <Typography 
        variant="h4" 
        fontWeight={600} 
        sx={{ 
          color: color === 'success' ? 'success.main' : color === 'danger' ? 'error.main' : 'text.primary' 
        }}
      >
        {value}
      </Typography>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="ghost" size="small" onClick={() => navigate('/campaigns')}>
            <ArrowLeft size={18} />
          </Button>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {campaign.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {campaign.description || 'No description'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Badge variant={getStatusVariant(campaign.status)} sx={{ fontSize: '1rem', px: 2, py: 0.5 }}>
            {campaign.status}
          </Badge>
          {campaign.status === 'draft' && (
            <Button 
              startIcon={<Send size={18} />} 
              onClick={openSendConfirmation} 
              loading={sending}
              disabled={campaign.template_status && campaign.template_status !== 'approved'}
            >
              {campaign.template_status && campaign.template_status !== 'approved' 
                 ? `Template ${campaign.template_status}` 
                 : 'Send Campaign'}
            </Button>
          )}
          {(campaign.failedCount > 0 || campaign.failed_count > 0) && (
            <Button variant="secondary" startIcon={<AlertCircle size={18} />} onClick={() => setShowErrors(true)}>
              View Errors
            </Button>
          )}
        </Stack>
      </Box>

      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard 
            label="Template" 
            value={
              <Box>
                <Typography variant="h5" fontWeight={600}>{campaign.template_name || 'Not selected'}</Typography>
                {campaign.template_status && (
                  <Badge variant={campaign.template_status === 'approved' ? 'success' : 'warning'} sx={{ mt: 1 }}>
                    {campaign.template_status.toUpperCase()}
                  </Badge>
                )}
              </Box>
            } 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard label="Total Persons" value={campaign.totalContacts || campaign.total_contacts || 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard label="Sent" value={campaign.sentCount || campaign.sent_count || 0} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard label="Failed" value={campaign.failedCount || campaign.failed_count || 0} color="danger" />
        </Grid>
      </Grid>

      <Card>
        <Card.Header>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Users size={20} />
              <Typography variant="h6">Campaign Persons</Typography>
            </Stack>
            {campaign.status === 'draft' && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCsvUpload}
                  style={{ display: 'none' }}
                />
                <Button 
                  variant="secondary" 
                  size="small" 
                  icon={Upload} 
                  onClick={() => fileInputRef.current?.click()}
                  loading={importing}
                >
                  Import CSV
                </Button>
                <Button variant="secondary" size="small" icon={Plus} onClick={openAddContactsModal}>
                  Add Persons
                </Button>
              </Stack>
            )}
          </Box>
        </Card.Header>
        <Table 
          columns={personColumns} 
          data={campaign.contacts || []} 
          emptyMessage="No persons added yet" 
        />
      </Card>

      {/* Add Persons Modal */}
      <Modal
        isOpen={showAddContacts}
        onClose={() => setShowAddContacts(false)}
        title="Add Persons to Campaign"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddContacts(false)}>Cancel</Button>
            <Button onClick={handleAddContacts} disabled={selectedContacts.length === 0}>
              Add {selectedContacts.length} Persons
            </Button>
          </>
        }
      >
        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select persons from your database to add to this campaign:
          </Typography>
          
          <SearchableSelect
            options={allContacts}
            value={selectedContacts}
            onChange={setSelectedContacts}
            placeholder="Select persons..."
            searchPlaceholder="Search by name or phone..."
            multiple={true}
            labelKey="name"
            valueKey="id"
            loading={contactsLoading}
            renderOption={(props, person) => (
              <Box component="li" {...props} key={person.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{person.phone}</Typography>
                </Box>
              </Box>
            )}
          />
          
          {!contactsLoading && allContacts.length === 0 && (
            <Alert severity="warning">
              No persons available. Add persons first in the Persons page.
            </Alert>
          )}
        </Box>
      </Modal>

      {/* Send Confirmation Modal */}
      <Modal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        title="Confirm Send Campaign"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSendConfirm(false)}>Cancel</Button>
            <Button onClick={handleSend} startIcon={<Send size={18} />}>
              Confirm & Send
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity="warning" icon={<AlertTriangle size={20} />}>
            You are about to send messages to <strong>{campaign.contacts?.length || 0} persons</strong>. 
            This action cannot be undone.
          </Alert>

          {/* Template Preview */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <MessageSquare size={18} />
              <Typography variant="subtitle1" fontWeight={600}>Template Message</Typography>
            </Stack>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 2,
                maxHeight: 150,
                overflow: 'auto'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {campaign.template_preview || campaign.body_preview || 
                  `Template: ${campaign.template_name || 'N/A'}\nLanguage: ${campaign.template_language || 'en'}`}
              </Typography>
            </Paper>
          </Box>

          {/* Persons List */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Users size={18} />
              <Typography variant="subtitle1" fontWeight={600}>
                Recipients ({campaign.contacts?.length || 0})
              </Typography>
            </Stack>
            <Paper 
              variant="outlined" 
              sx={{ 
                maxHeight: 200, 
                overflow: 'auto',
                borderRadius: 2
              }}
            >
              <List dense disablePadding>
                {campaign.contacts?.map((person, index) => (
                  <Box key={person.contact_id || index}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ py: 1 }}>
                      <ListItemText
                        primary={person.name}
                        secondary={person.phone}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Modal>


      {/* Errors Modal */}
      <Modal
        isOpen={showErrors}
        onClose={() => setShowErrors(false)}
        title="Campaign Error Logs"
        size="large"
        footer={<Button onClick={() => setShowErrors(false)}>Close</Button>}
      >
        <CampaignErrors campaignId={id} onClose={() => setShowErrors(false)} />
      </Modal>

      {/* Error Detail Dialog */}
      <Modal
        isOpen={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, name: '', error: '' })}
        title={`Error for ${errorDialog.name}`}
        size="medium"
        footer={<Button onClick={() => setErrorDialog({ open: false, name: '', error: '' })}>Close</Button>}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" component="pre" sx={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            backgroundColor: '#1e1e1e',
            color: '#f0f0f0',
            p: 2,
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}>
            {errorDialog.error}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}
