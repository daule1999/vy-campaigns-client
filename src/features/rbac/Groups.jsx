import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, Tooltip, Alert, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button as MuiButton, FormControl, InputLabel, Select, MenuItem,
    Checkbox, ListItemText, OutlinedInput
} from '@mui/material';
import { Plus, Edit2, Trash2, Users, Shield } from 'lucide-react';
import { rbacApi, adminApi } from '../../api';
import { Button } from '../../components/common';
import useAuthStore from '../../store/authStore';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', level: 10, permissionIds: [] });
    const { isSuperAdmin, hasPermission } = useAuthStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupsRes, permsRes, usersRes] = await Promise.all([
                rbacApi.getGroups(),
                rbacApi.getPermissions(),
                adminApi.getUsers()
            ]);
            setGroups(groupsRes.data.data || []);
            setPermissions(permsRes.data.data || []);
            setUsers(usersRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                name: group.name,
                description: group.description || '',
                level: group.level || 10,
                permissionIds: group.permissions?.map(p => p.id) || []
            });
        } else {
            setEditingGroup(null);
            setFormData({ name: '', description: '', level: 10, permissionIds: [] });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingGroup(null);
        setFormData({ name: '', description: '', level: 10, permissionIds: [] });
    };

    const handleSave = async () => {
        try {
            if (editingGroup) {
                await rbacApi.updateGroup(editingGroup.id, { 
                    name: formData.name, 
                    description: formData.description,
                    level: formData.level
                });
                await rbacApi.setGroupPermissions(editingGroup.id, formData.permissionIds);
            } else {
                const res = await rbacApi.createGroup({ 
                    name: formData.name, 
                    description: formData.description,
                    level: formData.level
                });
                if (formData.permissionIds.length > 0) {
                    await rbacApi.setGroupPermissions(res.data.data.id, formData.permissionIds);
                }
            }
            handleCloseDialog();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save group');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            await rbacApi.deleteGroup(id);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete group');
        }
    };

    // Group permissions by feature for display
    const permissionsByFeature = permissions.reduce((acc, p) => {
        if (!acc[p.feature]) acc[p.feature] = [];
        acc[p.feature].push(p);
        return acc;
    }, {});

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Groups
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage user groups and their permissions
                    </Typography>
                </Box>
                <Button startIcon={<Plus size={18} />} onClick={() => handleOpenDialog()}>
                    New Group
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
                            <TableCell sx={{ fontWeight: 600 }} align="center">Level</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Users</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Shield size={16} />
                                        <strong>{group.name}</strong>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={`L${group.level || 10}`} 
                                        size="small" 
                                        color={group.level <= 3 ? 'warning' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{group.description || '-'}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(group.permissions || []).slice(0, 3).map(p => (
                                            <Chip key={p.id} label={p.name} size="small" variant="outlined" />
                                        ))}
                                        {(group.permissions || []).length > 3 && (
                                            <Chip label={`+${group.permissions.length - 3}`} size="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        icon={<Users size={14} />} 
                                        label={`${(group.users || []).length} users`} 
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleOpenDialog(group)}>
                                            <Edit2 size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    {isSuperAdmin && (
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDelete(group.id)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {groups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No groups yet. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingGroup ? 'Edit Group' : 'Create Group'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Group Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Hierarchy Level"
                            type="number"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 10 })}
                            fullWidth
                            inputProps={{ min: 1, max: 10 }}
                            helperText="1 = Highest rank (Admin), 10 = Lowest rank. Users can only manage lower-ranked users."
                        />
                        <FormControl fullWidth>
                            <InputLabel>Permissions</InputLabel>
                            <Select
                                multiple
                                value={formData.permissionIds}
                                onChange={(e) => setFormData({ ...formData, permissionIds: e.target.value })}
                                input={<OutlinedInput label="Permissions" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => {
                                            const perm = permissions.find(p => p.id === id);
                                            return perm ? <Chip key={id} label={perm.name} size="small" /> : null;
                                        })}
                                    </Box>
                                )}
                            >
                                {Object.entries(permissionsByFeature).map(([feature, perms]) => [
                                    <MenuItem key={`header-${feature}`} disabled sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                                        {feature.toUpperCase()}
                                    </MenuItem>,
                                    ...perms.map(p => (
                                        <MenuItem key={p.id} value={p.id}>
                                            <Checkbox checked={formData.permissionIds.includes(p.id)} />
                                            <ListItemText primary={p.name} secondary={p.description} />
                                        </MenuItem>
                                    ))
                                ])}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleCloseDialog}>Cancel</MuiButton>
                    <MuiButton onClick={handleSave} variant="contained" disabled={!formData.name}>
                        {editingGroup ? 'Save' : 'Create'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
