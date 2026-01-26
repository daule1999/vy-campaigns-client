import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    MoreVert as MoreIcon,
    Email as EmailIcon,
    PersonAdd as InviteIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { agentsApi } from '../../api';
import useAuthStore from '../../store/authStore';

const AgentList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const { isSuperAdmin, hasPermission } = useAuthStore();

    const canInvite = isSuperAdmin || hasPermission('agents:invite');
    const canEdit = isSuperAdmin || hasPermission('agents:write');
    const canDelete = isSuperAdmin || hasPermission('agents:delete');

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await agentsApi.getAll();
            setAgents(response.data || []);
        } catch (error) {
            console.error('Error loading agents:', error);
            // Mock data
            setAgents([
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: new Date().toISOString() },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Agent', status: 'active', lastLogin: new Date().toISOString() },
                { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Agent', status: 'pending', lastLogin: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, agent) => {
        setAnchorEl(event.currentTarget);
        setSelectedAgent(agent);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedAgent(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'inactive': return 'default';
            default: return 'default';
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4">Agents</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage team members and their access
                    </Typography>
                </Box>
                {canInvite && (
                    <Button
                        variant="contained"
                        startIcon={<InviteIcon />}
                    >
                        Invite Agent
                    </Button>
                )}
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{agents.length}</Typography>
                            <Typography color="text.secondary">Total Agents</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="success.main">
                                {agents.filter(a => a.status === 'active').length}
                            </Typography>
                            <Typography color="text.secondary">Active</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="warning.main">
                                {agents.filter(a => a.status === 'pending').length}
                            </Typography>
                            <Typography color="text.secondary">Pending</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="text.secondary">
                                {agents.filter(a => a.status === 'inactive').length}
                            </Typography>
                            <Typography color="text.secondary">Inactive</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 3 }}
            />

            {/* Agents Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Agent</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Last Login</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAgents.map((agent) => (
                            <TableRow key={agent.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {getInitials(agent.name)}
                                        </Avatar>
                                        <Typography>{agent.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{agent.email}</TableCell>
                                <TableCell>
                                    <Chip label={agent.role} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={agent.status} 
                                        size="small" 
                                        color={getStatusColor(agent.status)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {agent.lastLogin 
                                        ? new Date(agent.lastLogin).toLocaleDateString() 
                                        : 'Never'}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={(e) => handleMenuOpen(e, agent)}>
                                        <MoreIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredAgents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        {searchQuery ? 'No agents match your search' : 'No agents yet'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {canEdit && (
                    <MenuItem onClick={handleMenuClose}>
                        <EditIcon sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                )}
                <MenuItem onClick={handleMenuClose}>
                    <EmailIcon sx={{ mr: 1 }} /> Resend Invitation
                </MenuItem>
                {canDelete && (
                    <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} /> Remove
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default AgentList;
