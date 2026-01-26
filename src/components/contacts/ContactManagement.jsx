import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { contactService, tagService } from '../../api/services';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactTags, setContactTags] = useState([]);

  useEffect(() => {
    loadContacts();
    loadTags();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');

      const response = await contactService.getAll(params);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    loadContacts();
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setTimeout(loadContacts, 100);
  };

  const handleTagFilter = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    setTimeout(loadContacts, 100);
  };

  const openTagManagement = (contact) => {
    setSelectedContact(contact);
    setContactTags(contact.tags?.map(t => t.id) || []);
    setOpenTagDialog(true);
  };

  const handleTagToggle = (tagId) => {
    setContactTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSaveTags = async () => {
    if (!selectedContact) return;

    try {
      const currentTagIds = selectedContact.tags?.map(t => t.id) || [];
      const tagsToAdd = contactTags.filter(id => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter(id => !contactTags.includes(id));

      if (tagsToAdd.length > 0) {
        await contactService.addTags(selectedContact.id, tagsToAdd);
      }
      if (tagsToRemove.length > 0) {
        await contactService.removeTags(selectedContact.id, tagsToRemove);
      }

      setOpenTagDialog(false);
      loadContacts();
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Contacts</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Contact
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, email"
                value={search}
                onChange={handleSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                  <MenuItem value="opted_out">Opted Out</MenuItem>
                  <MenuItem value="invalid">Invalid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box>
                <Typography variant="body2" gutterBottom>Filter by Tags:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      onClick={() => handleTagFilter(tag.id)}
                      color={selectedTags.includes(tag.id) ? 'primary' : 'default'}
                      sx={{
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                        color: selectedTags.includes(tag.id) ? 'white' : undefined,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Contacts</Typography>
              <Typography variant="h4">{contacts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h4">
                {contacts.filter(c => c.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Opted Out</Typography>
              <Typography variant="h4">
                {contacts.filter(c => c.status === 'opted_out').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Blocked</Typography>
              <Typography variant="h4">
                {contacts.filter(c => c.status === 'blocked').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contact Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Contacted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {contact.tags?.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          sx={{
                            backgroundColor: tag.color,
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {contact.assignedAgent?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contact.status}
                      size="small"
                      color={contact.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {contact.lastContactedAt
                      ? new Date(contact.lastContactedAt).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openTagManagement(contact)}>
                      <LabelIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Tag Management Dialog */}
      <Dialog open={openTagDialog} onClose={() => setOpenTagDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Tags - {selectedContact?.name}</DialogTitle>
        <DialogContent>
          <FormGroup>
            {tags.map((tag) => (
              <FormControlLabel
                key={tag.id}
                control={
                  <Checkbox
                    checked={contactTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      width={16}
                      height={16}
                      borderRadius="50%"
                      sx={{ backgroundColor: tag.color }}
                    />
                    <Typography>{tag.name}</Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTagDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTags} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactManagement;
