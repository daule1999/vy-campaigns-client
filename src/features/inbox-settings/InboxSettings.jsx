import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, Switch, TextField,
    Button, Alert, CircularProgress, Chip, FormControlLabel, Divider,
    Tabs, Tab, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Schedule, Message, Timer, AccessTime, Assignment } from '@mui/icons-material';
import { inboxSettingsApi } from '../../api';
import useAuthStore from '../../store/authStore';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} style={{ padding: '16px 0' }}>
            {value === index && children}
        </div>
    );
}

function InboxSettings() {
    const { hasPermission, isSuperAdmin } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState(0);

    // Settings state
    const [welcomeMessage, setWelcomeMessage] = useState({
        enabled: false,
        message: '',
        sentCount: 0
    });

    const [outOfOffice, setOutOfOffice] = useState({
        enabled: false,
        message: '',
        sentCount: 0
    });

    const [delayedResponse, setDelayedResponse] = useState({
        enabled: false,
        delayMinutes: 5,
        message: ''
    });

    const [workingHours, setWorkingHours] = useState({
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startTime: '10:00',
        endTime: '18:00'
    });

    const [autoAssignment, setAutoAssignment] = useState({
        enabled: false,
        mode: 'round-robin'
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const [welcomeRes, oooRes, delayedRes, hoursRes, assignRes] = await Promise.all([
                inboxSettingsApi.getWelcomeMessage().catch(() => ({ data: { data: {} } })),
                inboxSettingsApi.getOutOfOffice().catch(() => ({ data: { data: {} } })),
                inboxSettingsApi.getDelayedResponse().catch(() => ({ data: { data: {} } })),
                inboxSettingsApi.getWorkingHours().catch(() => ({ data: { data: {} } })),
                inboxSettingsApi.getAutoAssignment().catch(() => ({ data: { data: {} } }))
            ]);
            
            if (welcomeRes.data.data) setWelcomeMessage(prev => ({ ...prev, ...welcomeRes.data.data }));
            if (oooRes.data.data) setOutOfOffice(prev => ({ ...prev, ...oooRes.data.data }));
            if (delayedRes.data.data) setDelayedResponse(prev => ({ ...prev, ...delayedRes.data.data }));
            if (hoursRes.data.data) setWorkingHours(prev => ({ ...prev, ...hoursRes.data.data }));
            if (assignRes.data.data) setAutoAssignment(prev => ({ ...prev, ...assignRes.data.data }));
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const saveWelcomeMessage = async () => {
        try {
            setSaving(true);
            await inboxSettingsApi.updateWelcomeMessage(welcomeMessage);
            setSuccess('Welcome message saved');
        } catch (err) {
            setError('Failed to save welcome message');
        } finally {
            setSaving(false);
        }
    };

    const saveOutOfOffice = async () => {
        try {
            setSaving(true);
            await inboxSettingsApi.updateOutOfOffice(outOfOffice);
            setSuccess('Out of office message saved');
        } catch (err) {
            setError('Failed to save out of office message');
        } finally {
            setSaving(false);
        }
    };

    const saveDelayedResponse = async () => {
        try {
            setSaving(true);
            await inboxSettingsApi.updateDelayedResponse(delayedResponse);
            setSuccess('Delayed response settings saved');
        } catch (err) {
            setError('Failed to save delayed response settings');
        } finally {
            setSaving(false);
        }
    };

    const saveWorkingHours = async () => {
        try {
            setSaving(true);
            await inboxSettingsApi.updateWorkingHours(workingHours);
            setSuccess('Working hours saved');
        } catch (err) {
            setError('Failed to save working hours');
        } finally {
            setSaving(false);
        }
    };

    const canWrite = isSuperAdmin || hasPermission('inbox_settings:write');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Inbox Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage Auto replies to user messages and improve your customer experience
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab icon={<Schedule />} label="Working Hours" />
                        <Tab icon={<Message />} label="Welcome Message" />
                        <Tab icon={<AccessTime />} label="Out of Office" />
                        <Tab icon={<Timer />} label="Delayed Response" />
                        <Tab icon={<Assignment />} label="Auto Assignment" />
                    </Tabs>
                </Box>

                {/* Working Hours Tab */}
                <TabPanel value={tab} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Setup your working hours</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {workingHours.days.join(', ')} {workingHours.startTime} to {workingHours.endTime}
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Start Time"
                                    type="time"
                                    value={workingHours.startTime}
                                    onChange={(e) => setWorkingHours({ ...workingHours, startTime: e.target.value })}
                                    fullWidth
                                    disabled={!canWrite}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="End Time"
                                    type="time"
                                    value={workingHours.endTime}
                                    onChange={(e) => setWorkingHours({ ...workingHours, endTime: e.target.value })}
                                    fullWidth
                                    disabled={!canWrite}
                                />
                            </Grid>
                        </Grid>
                        
                        {canWrite && (
                            <Button 
                                variant="contained" 
                                onClick={saveWorkingHours} 
                                disabled={saving}
                                sx={{ mt: 3 }}
                            >
                                Save Working Hours
                            </Button>
                        )}
                    </Box>
                </TabPanel>

                {/* Welcome Message Tab */}
                <TabPanel value={tab} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h6">Welcome Message</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Configure greeting message for new customers
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={welcomeMessage.enabled}
                                            onChange={(e) => setWelcomeMessage({ ...welcomeMessage, enabled: e.target.checked })}
                                            disabled={!canWrite}
                                        />
                                    }
                                    label={welcomeMessage.enabled ? 'Enabled' : 'Disabled'}
                                />
                                {welcomeMessage.sentCount > 0 && (
                                    <Chip 
                                        label={`${welcomeMessage.sentCount} messages sent`} 
                                        size="small" 
                                        color="success"
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        <TextField
                            label="Welcome Message"
                            value={welcomeMessage.message}
                            onChange={(e) => setWelcomeMessage({ ...welcomeMessage, message: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Hi there! Thanks for reaching out to us..."
                            disabled={!canWrite}
                        />
                        
                        {canWrite && (
                            <Button 
                                variant="contained" 
                                onClick={saveWelcomeMessage} 
                                disabled={saving}
                                sx={{ mt: 2 }}
                            >
                                Save Welcome Message
                            </Button>
                        )}
                    </Box>
                </TabPanel>

                {/* Out of Office Tab */}
                <TabPanel value={tab} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h6">Out of Office Message</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Auto reply outside working hours
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={outOfOffice.enabled}
                                            onChange={(e) => setOutOfOffice({ ...outOfOffice, enabled: e.target.checked })}
                                            disabled={!canWrite}
                                        />
                                    }
                                    label={outOfOffice.enabled ? 'Enabled' : 'Disabled'}
                                />
                                {outOfOffice.sentCount > 0 && (
                                    <Chip 
                                        label={`${outOfOffice.sentCount} messages sent`} 
                                        size="small" 
                                        color="success"
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        <TextField
                            label="Out of Office Message"
                            value={outOfOffice.message}
                            onChange={(e) => setOutOfOffice({ ...outOfOffice, message: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Thank you for contacting us! Our office is currently closed..."
                            disabled={!canWrite}
                        />
                        
                        {canWrite && (
                            <Button 
                                variant="contained" 
                                onClick={saveOutOfOffice} 
                                disabled={saving}
                                sx={{ mt: 2 }}
                            >
                                Save Out of Office
                            </Button>
                        )}
                    </Box>
                </TabPanel>

                {/* Delayed Response Tab */}
                <TabPanel value={tab} index={3}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h6">Delayed Response Message</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Auto reply when response is delayed
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={delayedResponse.enabled}
                                        onChange={(e) => setDelayedResponse({ ...delayedResponse, enabled: e.target.checked })}
                                        disabled={!canWrite}
                                    />
                                }
                                label={delayedResponse.enabled ? 'Enabled' : 'Disabled'}
                            />
                        </Box>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Delay (minutes)"
                                    type="number"
                                    value={delayedResponse.delayMinutes}
                                    onChange={(e) => setDelayedResponse({ ...delayedResponse, delayMinutes: parseInt(e.target.value) })}
                                    fullWidth
                                    disabled={!canWrite}
                                />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    label="Delayed Response Message"
                                    value={delayedResponse.message}
                                    onChange={(e) => setDelayedResponse({ ...delayedResponse, message: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Sorry for the delay! We're experiencing high volume..."
                                    disabled={!canWrite}
                                />
                            </Grid>
                        </Grid>
                        
                        {canWrite && (
                            <Button 
                                variant="contained" 
                                onClick={saveDelayedResponse} 
                                disabled={saving}
                                sx={{ mt: 2 }}
                            >
                                Save Delayed Response
                            </Button>
                        )}
                    </Box>
                </TabPanel>

                {/* Auto Assignment Tab */}
                <TabPanel value={tab} index={4}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6">Chat Assignment</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Automatically assign chats to agents
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoAssignment.enabled}
                                        onChange={(e) => setAutoAssignment({ ...autoAssignment, enabled: e.target.checked })}
                                        disabled={!canWrite}
                                    />
                                }
                                label="Enable Auto Assignment"
                            />
                        </Box>
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Assignment Mode</InputLabel>
                            <Select
                                value={autoAssignment.mode}
                                onChange={(e) => setAutoAssignment({ ...autoAssignment, mode: e.target.value })}
                                label="Assignment Mode"
                                disabled={!canWrite}
                            >
                                <MenuItem value="round-robin">Round Robin</MenuItem>
                                <MenuItem value="load-balanced">Load Balanced</MenuItem>
                                <MenuItem value="team-based">Team Based</MenuItem>
                                <MenuItem value="skill-based">Skill Based</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <Alert severity="info">
                            Auto assignment will distribute incoming chats to available agents based on the selected mode.
                        </Alert>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
}

export default InboxSettings;
