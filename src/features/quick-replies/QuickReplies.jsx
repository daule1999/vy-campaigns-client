import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Alert, CircularProgress, Tooltip, MenuItem, Select, FormControl, InputLabel,
    Tabs, Tab, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, Reply } from '@mui/icons-material';
import { quickRepliesApi } from '../../api';
import useAuthStore from '../../store/authStore';

function QuickReplies() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [quickReplies, setQuickReplies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedReply, setSelectedReply] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        shortcut: '',
        message: '',
        category: '',
        isGlobal: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [repliesRes, categoriesRes] = await Promise.all([
                quickRepliesApi.getAll(),
                quickRepliesApi.getCategories().catch(() => ({ data: { data: ['General', 'Support', 'Sales', 'Greetings'] } }))
            ]);
            setQuickReplies(repliesRes.data.data || []);
            setCategories(categoriesRes.data.data || ['General', 'Support', 'Sales', 'Greetings']);
        } catch (err) {
            setError('Failed to load quick replies');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await quickRepliesApi.update(selectedReply.id, formData);
                setSuccess('Quick reply updated');
            } else {
                await quickRepliesApi.create(formData);
                setSuccess('Quick reply created');
            }
            setDialogOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save quick reply');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quick reply?')) return;
        try {
            await quickRepliesApi.delete(id);
            setSuccess('Quick reply deleted');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const openEditDialog = (reply) => {
        setSelectedReply(reply);
        setFormData({
            shortcut: reply.shortcut,
            message: reply.message,
            category: reply.category || '',
            isGlobal: reply.isGlobal
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
        setFormData({ shortcut: '', message: '', category: '', isGlobal: true });
        setSelectedReply(null);
    };

    const filteredReplies = quickReplies.filter(reply => {
        const matchesSearch = reply.shortcut?.toLowerCase().includes(search.toLowerCase()) ||
                             reply.message?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || reply.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const canWrite = isSuperAdmin || hasPermission('quick_replies:write');

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
                    <Typography variant="h4" gutterBottom>Quick Replies</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create shortcuts for frequently used messages
                    </Typography>
                </Box>
                {canWrite && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateDialog}
                    >
                        Add Quick Reply
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search quick replies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            )
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Shortcut</TableCell>
                            <TableCell>Message Preview</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReplies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <Reply sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No quick replies found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReplies.map((reply) => (
                                <TableRow key={reply.id} hover>
                                    <TableCell>
                                        <Chip label={`/${reply.shortcut}`} color="primary" size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography noWrap sx={{ maxWidth: 400 }}>
                                            {reply.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={reply.category || 'General'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={reply.isGlobal ? 'Global' : 'Personal'} 
                                            size="small" 
                                            color={reply.isGlobal ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {canWrite && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => openEditDialog(reply)}>
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" onClick={() => handleDelete(reply.id)}>
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
                <DialogTitle>{editing ? 'Edit Quick Reply' : 'Add Quick Reply'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Shortcut"
                        value={formData.shortcut}
                        onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                        helperText="Type /shortcut in chat to use"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">/</InputAdornment>
                        }}
                    />
                    <TextField
                        label="Message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        required
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            label="Category"
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={!formData.shortcut || !formData.message}
                    >
                        {editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default QuickReplies;
