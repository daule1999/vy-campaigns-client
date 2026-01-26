import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Switch,
    Menu,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    MoreVert as MoreIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    ContentCopy as DuplicateIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import { workflowsApi } from '../../api';
import useAuthStore from '../../store/authStore';

const WorkflowList = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const { isSuperAdmin, hasPermission } = useAuthStore();

    const canCreate = isSuperAdmin || hasPermission('workflows:write');
    const canEdit = isSuperAdmin || hasPermission('workflows:write');
    const canDelete = isSuperAdmin || hasPermission('workflows:delete');

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const response = await workflowsApi.getAll();
            setWorkflows(response.data || []);
        } catch (error) {
            console.error('Error loading workflows:', error);
            // Mock data
            setWorkflows([
                { id: 1, name: 'Welcome Flow', description: 'Sends welcome message to new contacts', isActive: true, triggerType: 'contact_created', executionCount: 156 },
                { id: 2, name: 'Follow-up Sequence', description: 'Automated follow-up after 3 days', isActive: true, triggerType: 'delay', executionCount: 89 },
                { id: 3, name: 'VIP Customer Alert', description: 'Notify team when VIP signs up', isActive: false, triggerType: 'tag_added', executionCount: 23 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (workflow) => {
        try {
            if (workflow.isActive) {
                await workflowsApi.deactivate(workflow.id);
            } else {
                await workflowsApi.activate(workflow.id);
            }
            loadWorkflows();
        } catch (error) {
            console.error('Error toggling workflow:', error);
        }
    };

    const handleMenuOpen = (event, workflow) => {
        setAnchorEl(event.currentTarget);
        setSelectedWorkflow(workflow);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedWorkflow(null);
    };

    const getTriggerLabel = (type) => {
        const labels = {
            'contact_created': 'Contact Created',
            'tag_added': 'Tag Added',
            'delay': 'Time Delay',
            'webhook': 'Webhook',
            'manual': 'Manual',
        };
        return labels[type] || type;
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <Typography variant="h4">Workflows</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Automate your messaging with workflow sequences
                    </Typography>
                </Box>
                {canCreate && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        Create Workflow
                    </Button>
                )}
            </Box>

            {/* Stats */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{workflows.length}</Typography>
                            <Typography color="text.secondary">Total Workflows</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="success.main">
                                {workflows.filter(w => w.isActive).length}
                            </Typography>
                            <Typography color="text.secondary">Active</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="primary.main">
                                {workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0)}
                            </Typography>
                            <Typography color="text.secondary">Total Executions</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search workflows..."
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

            {/* Workflow Cards */}
            <Grid container spacing={2}>
                {filteredWorkflows.map((workflow) => (
                    <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                    <Box flex={1}>
                                        <Typography variant="h6">{workflow.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {workflow.description}
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, workflow)}>
                                        <MoreIcon />
                                    </IconButton>
                                </Box>

                                <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                                    <Chip
                                        icon={<TimelineIcon />}
                                        label={getTriggerLabel(workflow.triggerType)}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${workflow.executionCount || 0} runs`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {workflow.isActive ? (
                                            <Chip icon={<PlayIcon />} label="Active" color="success" size="small" />
                                        ) : (
                                            <Chip icon={<PauseIcon />} label="Paused" size="small" />
                                        )}
                                    </Box>
                                    {canEdit && (
                                        <Switch
                                            checked={workflow.isActive}
                                            onChange={() => handleToggleActive(workflow)}
                                            size="small"
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {filteredWorkflows.length === 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    {searchQuery ? 'No workflows match your search' : 'No workflows yet'}
                                </Typography>
                                {canCreate && !searchQuery && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        sx={{ mt: 2 }}
                                    >
                                        Create your first workflow
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

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
                    <DuplicateIcon sx={{ mr: 1 }} /> Duplicate
                </MenuItem>
                {canDelete && (
                    <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default WorkflowList;
