import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Chip, Alert, CircularProgress, Tooltip, Tabs, Tab, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, Sensors, Timeline } from '@mui/icons-material';
import { eventsApi } from '../../api';
import useAuthStore from '../../store/authStore';

function Events() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState(0);

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        traits: ''
    });

    // Default events (hardcoded as they're system events)
    const defaultEvents = [
        { name: 'Click Tracking', traits: 'created_at_utc, Campaign Id, Template Id, Type, Link, Button Text, Click Time', info: 'Tracked whenever a click on a campaign message\'s button is detected.' },
        { name: 'Phone Number Updated', traits: 'country_code, phone_number', info: '' },
        { name: 'Flow Completed', traits: 'Campaign Id, Flow Id, Flow Token', info: 'Tracked whenever your customer fills & sends a WhatsApp Form.' },
        { name: 'CTWA Notification', traits: 'source_id, source_url', info: 'Tracked whenever a customer starts conversation via a CTWA ad.' },
        { name: 'Replied to Notification', traits: 'Reply Text, Reply Date, Campaign Name', info: 'Tracked whenever a campaign message is replied to, within 72 hours.' },
        { name: 'Notification Sent', traits: 'created_at_utc, Campaign Name, Date Sent, Channel, Template Name, Sent, Delivered, Read, Failed, Error', info: 'Tracked whenever a campaign message is sent / delivered / read / failed.' }
    ];

    useEffect(() => {
        loadDefinitions();
    }, []);

    const loadDefinitions = async () => {
        try {
            setLoading(true);
            const response = await eventsApi.getDefinitions();
            setDefinitions(response.data.data || []);
        } catch (err) {
            // Fallback to empty - API might not be implemented
            setDefinitions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await eventsApi.createDefinition({
                ...formData,
                traits: formData.traits.split(',').map(t => t.trim()).filter(Boolean)
            });
            setSuccess('Custom event created');
            setDialogOpen(false);
            resetForm();
            loadDefinitions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this custom event?')) return;
        try {
            await eventsApi.deleteDefinition(id);
            setSuccess('Event deleted');
            loadDefinitions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', traits: '' });
    };

    const canWrite = isSuperAdmin || hasPermission('events:write');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Events Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage all default & custom events in your account
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Default Events */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sensors /> Default Events
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Event Traits</TableCell>
                            <TableCell>Event Info</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {defaultEvents.map((event, index) => (
                            <TableRow key={index} hover>
                                <TableCell>
                                    <Typography fontWeight="medium">{event.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                                        {event.traits}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {event.info || '-'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Custom Events */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline /> Custom Events
                    <Chip label={`Used: ${definitions.length}/10`} size="small" variant="outlined" />
                </Typography>
                {canWrite && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setDialogOpen(true)}
                    >
                        Add Custom Event
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Event Traits</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {definitions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <Timeline sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography color="text.secondary">No custom events created</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Create custom events to track specific actions
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            definitions.map((event) => (
                                <TableRow key={event.id} hover>
                                    <TableCell>
                                        <Typography fontWeight="medium">{event.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {(event.traits || []).map((trait, i) => (
                                                <Chip key={i} label={trait} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        {canWrite && (
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(event.id)}>
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

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Custom Event</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Event Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                        sx={{ mt: 2, mb: 2 }}
                        placeholder="e.g., purchase_completed"
                    />
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Event Traits (comma-separated)"
                        value={formData.traits}
                        onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                        fullWidth
                        placeholder="e.g., product_id, amount, currency"
                        helperText="Define the properties to track with this event"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
                        Create Event
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Events;
