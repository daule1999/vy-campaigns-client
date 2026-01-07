import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Switch, Chip, IconButton, Tooltip, Alert,
    FormControl, Select, MenuItem, OutlinedInput, Checkbox, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import { Key as KeyIcon, LockReset as LockResetIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { adminApi } from '../../api';
import useAuthStore from '../../store/authStore';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const { isSuperAdmin, hasPermission } = useAuthStore();
    const canManageUsers = isSuperAdmin || hasPermission('admin:users');

    // Password reset dialog state
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [passwordResetLoading, setPasswordResetLoading] = useState(false);

    // Create user dialog state
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', password: '', name: '', email: '', groupIds: [] });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, groupsRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getGroups()
            ]);
            if (usersRes.data.success) {
                setUsers(usersRes.data.data);
            }
            if (groupsRes.data.success) {
                setGroups(groupsRes.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const endpoint = currentStatus ? 'deactivateUser' : 'activateUser';
            await adminApi[endpoint](userId);
            setUsers(users.map(u => 
                u.id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user status');
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleGroupsChange = async (userId, groupIds) => {
        setActionLoading(prev => ({ ...prev, [`groups_${userId}`]: true }));
        try {
            await adminApi.updateUserGroups(userId, groupIds);
            setUsers(users.map(u => 
                u.id === userId 
                    ? { ...u, groups: groups.filter(g => groupIds.includes(g.id)) } 
                    : u
            ));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update groups');
        } finally {
            setActionLoading(prev => ({ ...prev, [`groups_${userId}`]: false }));
        }
    };

    const handleGenerateApiKey = async (userId) => {
        setActionLoading(prev => ({ ...prev, [`key_${userId}`]: true }));
        try {
            const response = await adminApi.generateApiKey(userId);
            if (response.data.success) {
                alert(`API Key generated: ${response.data.data.apiKey}\n\nCopy this now - it won't be shown again!`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate API key');
        } finally {
            setActionLoading(prev => ({ ...prev, [`key_${userId}`]: false }));
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setPasswordResetLoading(true);
        try {
            const response = await adminApi.resetPassword(resetPasswordUser.id, newPassword);
            if (response.data.success) {
                setSuccess(`Password reset successfully for ${resetPasswordUser.name}`);
                setResetPasswordUser(null);
                setNewPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setPasswordResetLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!createForm.username || !createForm.password || !createForm.name) {
            setError('Username, password, and name are required');
            return;
        }
        if (createForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setCreateLoading(true);
        try {
            const response = await adminApi.createUser(createForm);
            if (response.data.success) {
                setSuccess(`User "${createForm.name}" created successfully`);
                setShowCreateDialog(false);
                setCreateForm({ username: '', password: '', name: '', email: '', groupIds: [] });
                fetchData(); // Refresh users list
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return <Typography>Loading users...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage user accounts, groups, and access
                    </Typography>
                </Box>
                {canManageUsers && (
                    <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                    >
                        Add User
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Groups</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Active</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography component="span" fontWeight={500}>
                                                {user.name}
                                            </Typography>
                                            {user.isSuperAdmin && (
                                                <Chip 
                                                    label="Superadmin" 
                                                    size="small" 
                                                    color="primary" 
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            @{user.username} {user.email && `• ${user.email}`}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {user.isSuperAdmin ? (
                                        <Chip label="All Access" size="small" color="success" />
                                    ) : groups.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No groups available
                                        </Typography>
                                    ) : (
                                        <FormControl size="small" sx={{ minWidth: 200 }}>
                                            <Select
                                                multiple
                                                value={(user.groups || []).map(g => g.id)}
                                                onChange={(e) => handleGroupsChange(user.id, e.target.value)}
                                                input={<OutlinedInput />}
                                                displayEmpty
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.length === 0 ? (
                                                            <Typography variant="body2" color="text.secondary">No groups assigned</Typography>
                                                        ) : (
                                                            selected.map((id) => {
                                                                const group = groups.find(g => g.id === id);
                                                                return group ? (
                                                                    <Chip key={id} label={group.name} size="small" />
                                                                ) : null;
                                                            })
                                                        )}
                                                    </Box>
                                                )}
                                                disabled={actionLoading[`groups_${user.id}`]}
                                            >
                                                {groups.map(g => (
                                                    <MenuItem key={g.id} value={g.id}>
                                                        <Checkbox checked={(user.groups || []).some(ug => ug.id === g.id)} />
                                                        <ListItemText primary={g.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={user.isActive ? 'Active' : 'Inactive'}
                                        color={user.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={user.isActive ?? true}
                                        onChange={() => handleToggleActive(user.id, user.isActive ?? true)}
                                        disabled={actionLoading[user.id] || user.isSuperAdmin}
                                        color="success"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                        <Tooltip title="Generate new API key">
                                            <IconButton 
                                                onClick={() => handleGenerateApiKey(user.id)}
                                                disabled={actionLoading[`key_${user.id}`]}
                                                size="small"
                                            >
                                                <KeyIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {isSuperAdmin && (
                                            <Tooltip title="Reset password">
                                                <IconButton 
                                                    onClick={() => setResetPasswordUser(user)}
                                                    size="small"
                                                    color="warning"
                                                >
                                                    <LockResetIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Reset Password Dialog */}
            <Dialog open={!!resetPasswordUser} onClose={() => setResetPasswordUser(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Set a new password for <strong>{resetPasswordUser?.name}</strong> (@{resetPasswordUser?.username})
                    </Typography>
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        helperText="Minimum 6 characters"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setResetPasswordUser(null); setNewPassword(''); }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleResetPassword} 
                        variant="contained" 
                        color="warning"
                        disabled={passwordResetLoading || newPassword.length < 6}
                    >
                        {passwordResetLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={createForm.username}
                            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                            helperText="Minimum 3 characters"
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Password"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            helperText="Minimum 6 characters"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            type="email"
                            label="Email (optional)"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <Select
                                multiple
                                value={createForm.groupIds}
                                onChange={(e) => setCreateForm({ ...createForm, groupIds: e.target.value })}
                                input={<OutlinedInput />}
                                displayEmpty
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">Select groups (optional)</Typography>
                                        ) : (
                                            selected.map((id) => {
                                                const group = groups.find(g => g.id === id);
                                                return group ? (
                                                    <Chip key={id} label={group.name} size="small" />
                                                ) : null;
                                            })
                                        )}
                                    </Box>
                                )}
                            >
                                {groups.map(g => (
                                    <MenuItem key={g.id} value={g.id}>
                                        <Checkbox checked={createForm.groupIds.includes(g.id)} />
                                        <ListItemText primary={g.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowCreateDialog(false); setCreateForm({ username: '', password: '', name: '', email: '', groupIds: [] }); }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateUser} 
                        variant="contained"
                        disabled={createLoading || !createForm.username || !createForm.password || !createForm.name}
                    >
                        {createLoading ? 'Creating...' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

