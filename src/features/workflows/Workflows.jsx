import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Alert, CircularProgress, Tooltip, Switch, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow, Pause, ContentCopy, Visibility, AccountTree } from '@mui/icons-material';
import { workflowsApi } from '../../api';
import useAuthStore from '../../store/authStore';

function Workflows() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        triggerType: 'keyword',
        triggerValue: '',
        isActive: false
    });

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const response = await workflowsApi.getAll();
            setWorkflows(response.data.data || []);
        } catch (err) {
            setError('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await workflowsApi.update(selectedWorkflow.id, formData);
                setSuccess('Workflow updated');
            } else {
                await workflowsApi.create(formData);
                setSuccess('Workflow created');
            }
            setDialogOpen(false);
            resetForm();
            loadWorkflows();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save workflow');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this workflow?')) return;
        try {
            await workflowsApi.delete(id);
            setSuccess('Workflow deleted');
            loadWorkflows();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleToggle = async (workflow) => {
        try {
            if (workflow.isActive) {
                await workflowsApi.deactivate(workflow.id);
            } else {
                await workflowsApi.activate(workflow.id);
            }
            loadWorkflows();
        } catch (err) {
            setError('Failed to toggle workflow');
        }
    };

    const handleDuplicate = async (id) => {
        try {
            await workflowsApi.duplicate(id);
            setSuccess('Workflow duplicated');
            loadWorkflows();
        } catch (err) {
            setError('Failed to duplicate workflow');
        }
    };

    const openEditDialog = (workflow) => {
        setSelectedWorkflow(workflow);
        setFormData({
            name: workflow.name,
            description: workflow.description || '',
            triggerType: workflow.triggerType,
            triggerValue: workflow.triggerValue || '',
            isActive: workflow.isActive
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
        setFormData({ name: '', description: '', triggerType: 'keyword', triggerValue: '', isActive: false });
        setSelectedWorkflow(null);
    };

    const getTriggerLabel = (type) => {
        const labels = {
            keyword: 'Keyword Match',
            button: 'Button Click',
            event: 'Event Trigger',
            schedule: 'Scheduled',
            manual: 'Manual'
        };
        return labels[type] || type;
    };

    const canWrite = isSuperAdmin || hasPermission('workflows:write');

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
                    <Typography variant="h4" gutterBottom>Workflows</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Automate repetitive WhatsApp messages with ease
                    </Typography>
                </Box>
                {canWrite && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateDialog}
                    >
                        New Workflow
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{workflows.length}</Typography>
                            <Typography color="text.secondary">Total Workflows</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="success.main">
                                {workflows.filter(w => w.isActive).length}
                            </Typography>
                            <Typography color="text.secondary">Active</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">
                                {workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0)}
                            </Typography>
                            <Typography color="text.secondary">Total Executions</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Status</TableCell>
                            <TableCell>Workflow Name</TableCell>
                            <TableCell>Trigger</TableCell>
                            <TableCell>Executions</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workflows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <AccountTree sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No workflows created yet</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            workflows.map((workflow) => (
                                <TableRow key={workflow.id} hover>
                                    <TableCell>
                                        <Switch
                                            checked={workflow.isActive}
                                            onChange={() => handleToggle(workflow)}
                                            disabled={!canWrite}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{workflow.name}</Typography>
                                        {workflow.description && (
                                            <Typography variant="caption" color="text.secondary">
                                                {workflow.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getTriggerLabel(workflow.triggerType)} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                        {workflow.triggerValue && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {workflow.triggerValue}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={workflow.executionCount || 0} 
                                            size="small"
                                            color={workflow.executionCount > 0 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(workflow.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        {canWrite && (
                                            <>
                                                <Tooltip title="Duplicate">
                                                    <IconButton size="small" onClick={() => handleDuplicate(workflow.id)}>
                                                        <ContentCopy />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => openEditDialog(workflow)}>
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" onClick={() => handleDelete(workflow.id)}>
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
                <DialogTitle>{editing ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Workflow Name"
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
                    <TextField
                        label="Trigger Type"
                        select
                        value={formData.triggerType}
                        onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                        SelectProps={{ native: true }}
                    >
                        <option value="keyword">Keyword Match</option>
                        <option value="button">Button Click</option>
                        <option value="event">Event Trigger</option>
                        <option value="schedule">Scheduled</option>
                        <option value="manual">Manual</option>
                    </TextField>
                    <TextField
                        label="Trigger Value (keyword, event name, etc.)"
                        value={formData.triggerValue}
                        onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
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

export default Workflows;
