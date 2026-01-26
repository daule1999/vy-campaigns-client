import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Avatar, AvatarGroup, Alert, CircularProgress, Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, Groups } from '@mui/icons-material';
import { teamsApi, adminApi } from '../../api';
import useAuthStore from '../../store/authStore';

function Teams() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialogs
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [membersDialogOpen, setMembersDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        leadIds: [],
        memberIds: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [teamsRes, usersRes] = await Promise.all([
                teamsApi.getAll(),
                adminApi.getUsers()
            ]);
            setTeams(teamsRes.data.data || []);
            setUsers(usersRes.data.data || []);
        } catch (err) {
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await teamsApi.create(formData);
            setSuccess('Team created successfully');
            setCreateDialogOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create team');
        }
    };

    const handleUpdate = async () => {
        try {
            await teamsApi.update(selectedTeam.id, formData);
            setSuccess('Team updated successfully');
            setEditDialogOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update team');
        }
    };

    const handleDelete = async (teamId) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        try {
            await teamsApi.delete(teamId);
            setSuccess('Team deleted successfully');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete team');
        }
    };

    const openEditDialog = (team) => {
        setSelectedTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            leadIds: team.leads?.map(l => l.id) || [],
            memberIds: team.members?.map(m => m.id) || []
        });
        setEditDialogOpen(true);
    };

    const openMembersDialog = (team) => {
        setSelectedTeam(team);
        setMembersDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', leadIds: [], memberIds: [] });
        setSelectedTeam(null);
    };

    const canWrite = isSuperAdmin || hasPermission('teams:write');
    const canDelete = isSuperAdmin || hasPermission('teams:delete');

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
                    <Typography variant="h4" gutterBottom>Teams</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Group your Agents into Teams to streamline your operations & control Contact Visibility
                    </Typography>
                </Box>
                {canWrite && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Team
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Team Leads</TableCell>
                            <TableCell>Team Members</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <Groups sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No teams created yet</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            teams.map((team) => (
                                <TableRow key={team.id} hover>
                                    <TableCell>
                                        <Typography fontWeight="medium">{team.name}</Typography>
                                        {team.description && (
                                            <Typography variant="caption" color="text.secondary">
                                                {team.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {team.leads?.length > 0 ? (
                                            <AvatarGroup max={3}>
                                                {team.leads.map(lead => (
                                                    <Tooltip key={lead.id} title={lead.name}>
                                                        <Avatar sx={{ width: 32, height: 32 }}>
                                                            {lead.name?.charAt(0)}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </AvatarGroup>
                                        ) : (
                                            <Chip label="No leads" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`${team.members?.length || 0} members`} 
                                            size="small" 
                                            onClick={() => openMembersDialog(team)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {canWrite && (
                                            <Tooltip title="Edit Team">
                                                <IconButton onClick={() => openEditDialog(team)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canDelete && (
                                            <Tooltip title="Delete Team">
                                                <IconButton color="error" onClick={() => handleDelete(team.id)}>
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

            {/* Create Team Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create a Team</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Team Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Team Members</InputLabel>
                        <Select
                            multiple
                            value={formData.memberIds}
                            onChange={(e) => setFormData({ ...formData, memberIds: e.target.value })}
                            label="Select Team Members"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((id) => {
                                        const user = users.find(u => u.id === id);
                                        return <Chip key={id} label={user?.name || id} size="small" />;
                                    })}
                                </Box>
                            )}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary">
                        Each Team must have at least 1 Lead. A Lead has access to all contacts where their 
                        teammates are Account Owners.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={!formData.name}>
                        Create Team
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Team Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Team Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Team Members</InputLabel>
                        <Select
                            multiple
                            value={formData.memberIds}
                            onChange={(e) => setFormData({ ...formData, memberIds: e.target.value })}
                            label="Team Members"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((id) => {
                                        const user = users.find(u => u.id === id);
                                        return <Chip key={id} label={user?.name || id} size="small" />;
                                    })}
                                </Box>
                            )}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={!formData.name}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Members Dialog */}
            <Dialog open={membersDialogOpen} onClose={() => setMembersDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedTeam?.name} - Members</DialogTitle>
                <DialogContent>
                    {selectedTeam?.members?.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                            {selectedTeam.members.map((member) => (
                                <Box 
                                    key={member.id} 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 1.5, 
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Avatar sx={{ mr: 2 }}>{member.name?.charAt(0)}</Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography>{member.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {member.email}
                                        </Typography>
                                    </Box>
                                    {selectedTeam.leads?.some(l => l.id === member.id) && (
                                        <Chip label="Lead" size="small" color="primary" />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary" sx={{ py: 3 }} align="center">
                            No members in this team
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMembersDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Teams;
