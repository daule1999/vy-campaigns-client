import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Alert, CircularProgress, Tooltip, Grid, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, LocalOffer } from '@mui/icons-material';
import { tagsApi } from '../../api';
import useAuthStore from '../../store/authStore';

// Color options for tags
const TAG_COLORS = [
    { name: 'Blue', value: '#2196f3' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Red', value: '#f44336' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Grey', value: '#607d8b' }
];

function Tags() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        color: '#2196f3',
        description: ''
    });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setLoading(true);
            const response = await tagsApi.getAll();
            setTags(response.data.data || []);
        } catch (err) {
            setError('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await tagsApi.update(selectedTag.id, formData);
                setSuccess('Tag updated');
            } else {
                await tagsApi.create(formData);
                setSuccess('Tag created');
            }
            setDialogOpen(false);
            resetForm();
            loadTags();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save tag');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this tag? It will be removed from all contacts.')) return;
        try {
            await tagsApi.delete(id);
            setSuccess('Tag deleted');
            loadTags();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const openEditDialog = (tag) => {
        setSelectedTag(tag);
        setFormData({
            name: tag.name,
            color: tag.color || '#2196f3',
            description: tag.description || ''
        });
        setEditing(true);
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        resetForm();
        setEditing(false);
        setDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', color: '#2196f3', description: '' });
        setSelectedTag(null);
    };

    const filteredTags = tags.filter(tag => 
        tag.name?.toLowerCase().includes(search.toLowerCase())
    );

    const canWrite = isSuperAdmin || hasPermission('tags:write');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>Tags</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Organize and categorize your contacts with tags
                    </Typography>
                </Box>
                {canWrite && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateDialog}
                    >
                        Add Tag
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ mb: 2, p: 2 }}>
                <TextField
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Tag</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Contacts</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTags.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <LocalOffer sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No tags found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTags.map((tag) => (
                                <TableRow key={tag.id} hover>
                                    <TableCell>
                                        <Chip 
                                            label={tag.name}
                                            sx={{ 
                                                backgroundColor: tag.color || '#2196f3',
                                                color: 'white'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {tag.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`${tag.contactCount || 0} contacts`} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(tag.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        {canWrite && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => openEditDialog(tag)}>
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" onClick={() => handleDelete(tag.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tag Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Color</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {TAG_COLORS.map((color) => (
                            <Box
                                key={color.value}
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: color.value,
                                    cursor: 'pointer',
                                    border: formData.color === color.value ? '3px solid black' : 'none',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            />
                        ))}
                    </Box>
                    <TextField
                        label="Description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
                        {editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Tags;
