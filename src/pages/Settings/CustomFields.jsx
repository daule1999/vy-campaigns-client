import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Chip,
    Switch,
    FormControlLabel,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
} from '@mui/icons-material';
import { contactFieldsApi } from '../../api';

const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Phone', icon: '📱' },
    { value: 'url', label: 'URL', icon: '🔗' },
    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
];

const CustomFields = () => {
    const [fields, setFields] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        type: 'text',
        required: false,
        description: '',
        options: '',
    });

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        try {
            setLoading(true);
            const response = await contactFieldsApi.getAll();
            setFields(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading fields:', err);
            setError('Failed to load custom fields');
            // Mock data for display
            setFields([
                { id: 1, name: 'company', label: 'Company Name', type: 'text', required: false },
                { id: 2, name: 'job_title', label: 'Job Title', type: 'text', required: false },
                { id: 3, name: 'birthdate', label: 'Birth Date', type: 'date', required: false },
                { id: 4, name: 'lead_source', label: 'Lead Source', type: 'dropdown', required: false, options: ['Website', 'Referral', 'Social Media', 'Event'] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (field = null) => {
        if (field) {
            setEditingField(field);
            setFormData({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required || false,
                description: field.description || '',
                options: Array.isArray(field.options) ? field.options.join(', ') : '',
            });
        } else {
            setEditingField(null);
            setFormData({
                name: '',
                label: '',
                type: 'text',
                required: false,
                description: '',
                options: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingField(null);
    };

    const handleSave = async () => {
        try {
            const data = {
                ...formData,
                options: formData.type === 'dropdown' ? formData.options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
            };
            
            if (editingField) {
                await contactFieldsApi.update(editingField.id, data);
            } else {
                await contactFieldsApi.create(data);
            }
            handleCloseDialog();
            loadFields();
        } catch (err) {
            console.error('Error saving field:', err);
            setError('Failed to save field');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this custom field?')) {
            try {
                await contactFieldsApi.delete(id);
                loadFields();
            } catch (err) {
                console.error('Error deleting field:', err);
                setError('Failed to delete field');
            }
        }
    };

    const getFieldTypeInfo = (type) => {
        return FIELD_TYPES.find(t => t.value === type) || { label: type, icon: '📝' };
    };

    return (
        <Box p={3}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4">Custom Fields</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Define custom fields to capture additional contact information
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Field
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}></TableCell>
                            <TableCell><strong>Field Name</strong></TableCell>
                            <TableCell><strong>Label</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Required</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((field) => {
                            const typeInfo = getFieldTypeInfo(field.type);
                            return (
                                <TableRow key={field.id} hover>
                                    <TableCell>
                                        <DragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {field.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{field.label}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={`${typeInfo.icon} ${typeInfo.label}`}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {field.required ? (
                                            <Chip size="small" label="Required" color="primary" />
                                        ) : (
                                            <Chip size="small" label="Optional" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenDialog(field)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(field.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {fields.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No custom fields defined yet
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenDialog()}
                                        sx={{ mt: 2 }}
                                    >
                                        Create your first field
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingField ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <TextField
                            fullWidth
                            label="Field Name"
                            helperText="Internal name (no spaces, lowercase)"
                            value={formData.name}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                name: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                            })}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Display Label"
                            helperText="Shown to users"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Field Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Field Type"
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {FIELD_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.type === 'dropdown' && (
                            <TextField
                                fullWidth
                                label="Dropdown Options"
                                helperText="Comma-separated list of options"
                                value={formData.options}
                                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                placeholder="Option 1, Option 2, Option 3"
                                sx={{ mb: 2 }}
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Description (optional)"
                            helperText="Help text shown to users"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.required}
                                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                                />
                            }
                            label="Required field"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained"
                        disabled={!formData.name || !formData.label}
                    >
                        {editingField ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomFields;
