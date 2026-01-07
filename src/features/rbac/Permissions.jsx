import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, Tooltip, Alert, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button as MuiButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import { rbacApi } from '../../api';
import { Button } from '../../components/common';
import useAuthStore from '../../store/authStore';

const FEATURES = [
    'dashboard', 'campaigns', 'templates', 'persons', 
    'audit', 'admin', 'rbac', 'autoresponders'
];

export default function Permissions() {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPerm, setEditingPerm] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', feature: '' });
    const { isSuperAdmin } = useAuthStore();

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const res = await rbacApi.getPermissions();
            setPermissions(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (perm = null) => {
        if (perm) {
            setEditingPerm(perm);
            setFormData({
                name: perm.name,
                description: perm.description || '',
                feature: perm.feature
            });
        } else {
            setEditingPerm(null);
            setFormData({ name: '', description: '', feature: '' });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingPerm(null);
        setFormData({ name: '', description: '', feature: '' });
    };

    const handleSave = async () => {
        try {
            if (editingPerm) {
                await rbacApi.updatePermission(editingPerm.id, formData);
            } else {
                await rbacApi.createPermission(formData);
            }
            handleCloseDialog();
            fetchPermissions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save permission');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this permission?')) return;
        try {
            await rbacApi.deletePermission(id);
            fetchPermissions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete permission');
        }
    };

    // Group by feature
    const permissionsByFeature = permissions.reduce((acc, p) => {
        if (!acc[p.feature]) acc[p.feature] = [];
        acc[p.feature].push(p);
        return acc;
    }, {});

    if (loading) return <Typography>Loading...</Typography>;

    if (!isSuperAdmin) {
        return (
            <Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>Permissions</Typography>
                <Alert severity="info">
                    Only superadmins can manage permissions. You can view the list below.
                </Alert>
                <Box sx={{ mt: 3 }}>
                    {Object.entries(permissionsByFeature).map(([feature, perms]) => (
                        <Box key={feature} sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
                                {feature}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {perms.map(p => (
                                    <Chip 
                                        key={p.id} 
                                        icon={<Key size={14} />}
                                        label={p.name} 
                                        title={p.description}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage system permissions (Superadmin only)
                    </Typography>
                </Box>
                <Button startIcon={<Plus size={18} />} onClick={() => handleOpenDialog()}>
                    New Permission
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map((perm) => (
                            <TableRow key={perm.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Key size={16} />
                                        <code>{perm.name}</code>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={perm.feature} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>{perm.description || '-'}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleOpenDialog(perm)}>
                                            <Edit2 size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => handleDelete(perm.id)}>
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingPerm ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Permission Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                            placeholder="e.g., reports:read"
                            helperText="Use format: feature:action (e.g., campaigns:delete)"
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Feature</InputLabel>
                            <Select
                                value={formData.feature}
                                onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                                label="Feature"
                            >
                                {FEATURES.map(f => (
                                    <MenuItem key={f} value={f}>{f}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleCloseDialog}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={!formData.name || !formData.feature}
                    >
                        {editingPerm ? 'Save' : 'Create'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
