import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Avatar, Alert, CircularProgress, Tooltip, MenuItem, Select, FormControl, InputLabel,
    Tabs, Tab
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, Refresh, Send } from '@mui/icons-material';
import { agentsApi, rolesApi } from '../../api';
import useAuthStore from '../../store/authStore';

function Agents() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [agents, setAgents] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState(0);

    // Dialogs
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        roleId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [agentsRes, rolesRes] = await Promise.all([
                agentsApi.getAll(),
                rolesApi.getAll()
            ]);
            setAgents(agentsRes.data.data || []);
            setRoles(rolesRes.data.data || []);
        } catch (err) {
            setError('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        try {
            await agentsApi.invite(formData);
            setSuccess('Invitation sent successfully');
            setInviteDialogOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send invitation');
        }
    };

    const handleUpdate = async () => {
        try {
            await agentsApi.update(selectedAgent.id, formData);
            setSuccess('Agent updated successfully');
            setEditDialogOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update agent');
        }
    };

    const handleDelete = async (agentId) => {
        if (!window.confirm('Are you sure you want to delete this agent?')) return;
        try {
            await agentsApi.delete(agentId);
            setSuccess('Agent deleted successfully');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete agent');
        }
    };

    const handleResendInvitation = async (agentId) => {
        try {
            await agentsApi.resendInvitation(agentId);
            setSuccess('Invitation resent successfully');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend invitation');
        }
    };

    const openEditDialog = (agent) => {
        setSelectedAgent(agent);
        setFormData({
            name: agent.name,
            email: agent.email,
            phone: agent.phone || '',
            roleId: agent.roleId || ''
        });
        setEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', roleId: '' });
        setSelectedAgent(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'invited': return 'warning';
            case 'inactive': return 'default';
            default: return 'default';
        }
    };

    const canWrite = isSuperAdmin || hasPermission('agents:write');
    const canInvite = isSuperAdmin || hasPermission('agents:invite');
    const canDelete = isSuperAdmin || hasPermission('agents:delete');

    // Filter agents by tab
    const filteredAgents = agents.filter(agent => {
        if (tab === 1) return agent.isSalesCRM;
        return true;
    });

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
                    <Typography variant="h4" gutterBottom>Manage Agents</Typography>
                    <Typography variant="body2" color="text.secondary">
                        You can create different types of Agents and easily manage existing ones from here
                    </Typography>
                </Box>
                {canInvite && (
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setInviteDialogOpen(true)}
                    >
                        Create Agent
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label="All Agents" />
                    <Tab label="Sales CRM Agents" />
                </Tabs>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Agent Name</TableCell>
                            <TableCell>Phone No.</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Last Logged In</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAgents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <PersonAdd sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No agents found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAgents.map((agent) => (
                                <TableRow key={agent.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {agent.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography>{agent.name}</Typography>
                                                {agent.status === 'invited' && (
                                                    <Chip 
                                                        label="Pending" 
                                                        size="small" 
                                                        color="warning" 
                                                        sx={{ fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{agent.phone || '-'}</TableCell>
                                    <TableCell>{agent.email}</TableCell>
                                    <TableCell>{agent.createdBy?.name || '-'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={agent.role?.name || 'No Role'} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {agent.lastLoginAt 
                                            ? new Date(agent.lastLoginAt).toLocaleDateString()
                                            : 'Not Yet Joined'
                                        }
                                    </TableCell>
                                    <TableCell align="right">
                                        {agent.status === 'invited' && canInvite && (
                                            <Tooltip title="Resend Invitation">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleResendInvitation(agent.id)}
                                                >
                                                    <Send fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canWrite && (
                                            <Tooltip title="Edit Agent">
                                                <IconButton onClick={() => openEditDialog(agent)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canDelete && (
                                            <Tooltip title="Delete Agent">
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => handleDelete(agent.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invite Agent Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Invite New Agent</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                            label="Role"
                        >
                            <MenuItem value="">Select Role</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setInviteDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button 
                        onClick={handleInvite} 
                        variant="contained" 
                        disabled={!formData.name || !formData.email}
                    >
                        Send Invitation
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Agent Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Agent</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                            label="Role"
                        >
                            <MenuItem value="">Select Role</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button 
                        onClick={handleUpdate} 
                        variant="contained" 
                        disabled={!formData.name || !formData.email}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Agents;
