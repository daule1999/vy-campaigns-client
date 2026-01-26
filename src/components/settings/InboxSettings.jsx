import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { inboxSettingsService } from '../../api/services';

const InboxSettings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    welcomeEnabled: false,
    welcomeText: '',
    oooEnabled: false,
    oooMessage: '',
    delayedEnabled: false,
    delayedTime: 300,
    delayedMessage: '',
    autoAssignmentEnabled: false,
    autoAssignmentType: 'round_robin',
    workingHours: {},
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await inboxSettingsService.get();
      const data = response.data;
      setSettings(data);
      setFormData({
        welcomeEnabled: data.welcomeMessageEnabled || false,
        welcomeText: data.welcomeMessageText || '',
        oooEnabled: data.oooEnabled || false,
        oooMessage: data.oooMessage || '',
        delayedEnabled: data.delayedResponseEnabled || false,
        delayedTime: data.delayedResponseTime || 300,
        delayedMessage: data.delayedResponseMessage || '',
        autoAssignmentEnabled: data.autoAssignmentEnabled || false,
        autoAssignmentType: data.autoAssignmentType || 'round_robin',
        workingHours: data.workingHours || {},
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveWelcome = async () => {
    try {
      setSaving(true);
      await inboxSettingsService.updateWelcomeMessage({
        enabled: formData.welcomeEnabled,
        text: formData.welcomeText,
      });
      setShowSuccess(true);
      loadSettings();
    } catch (error) {
      console.error('Error saving welcome message:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOOO = async () => {
    try {
      setSaving(true);
      await inboxSettingsService.updateOOO({
        enabled: formData.oooEnabled,
        message: formData.oooMessage,
      });
      setShowSuccess(true);
      loadSettings();
    } catch (error) {
      console.error('Error saving OOO:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDelayed = async () => {
    try {
      setSaving(true);
      await inboxSettingsService.updateDelayedResponse({
        enabled: formData.delayedEnabled,
        time: formData.delayedTime,
        message: formData.delayedMessage,
      });
      setShowSuccess(true);
      loadSettings();
    } catch (error) {
      console.error('Error saving delayed response:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAutoAssignment = async () => {
    try {
      setSaving(true);
      await inboxSettingsService.updateAutoAssignment({
        enabled: formData.autoAssignmentEnabled,
        type: formData.autoAssignmentType,
      });
      setShowSuccess(true);
      loadSettings();
    } catch (error) {
      console.error('Error saving auto-assignment:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Inbox Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Welcome Message</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.welcomeEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, welcomeEnabled: e.target.checked })
                      }
                    />
                  }
                  label="Enabled"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Welcome Message"
                multiline
                rows={4}
                value={formData.welcomeText}
                onChange={(e) => setFormData({ ...formData, welcomeText: e.target.value })}
                disabled={!formData.welcomeEnabled}
                placeholder="Hi {{contact.name}}! Welcome to our support..."
                helperText="Use {{contact.name}} for personalization"
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveWelcome}
                disabled={saving}
              >
                Save Welcome Message
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Out of Office */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Out of Office</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.oooEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, oooEnabled: e.target.checked })
                      }
                    />
                  }
                  label="Enabled"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="OOO Message"
                multiline
                rows={4}
                value={formData.oooMessage}
                onChange={(e) => setFormData({ ...formData, oooMessage: e.target.value })}
                disabled={!formData.oooEnabled}
                placeholder="Thanks for reaching out! We're currently out of office..."
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveOOO}
                disabled={saving}
              >
                Save OOO Message
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Delayed Response */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Delayed Response</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.delayedEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, delayedEnabled: e.target.checked })
                      }
                    />
                  }
                  label="Enabled"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                type="number"
                label="Delay Time (seconds)"
                value={formData.delayedTime}
                onChange={(e) =>
                  setFormData({ ...formData, delayedTime: parseInt(e.target.value) })
                }
                disabled={!formData.delayedEnabled}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Delayed Message"
                multiline
                rows={4}
                value={formData.delayedMessage}
                onChange={(e) =>
                  setFormData({ ...formData, delayedMessage: e.target.value })
                }
                disabled={!formData.delayedEnabled}
                placeholder="Sorry for the delay! An agent will be with you shortly..."
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveDelayed}
                disabled={saving}
              >
                Save Delayed Response
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Auto-Assignment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Auto-Assignment</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.autoAssignmentEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoAssignmentEnabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enabled"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  value={formData.autoAssignmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, autoAssignmentType: e.target.value })
                  }
                  disabled={!formData.autoAssignmentEnabled}
                  label="Assignment Type"
                >
                  <MenuItem value="round_robin">Round Robin</MenuItem>
                  <MenuItem value="load_balanced">Load Balanced</MenuItem>
                  <MenuItem value="team_based">Team Based</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                {formData.autoAssignmentType === 'round_robin' &&
                  'Distributes conversations equally among agents'}
                {formData.autoAssignmentType === 'load_balanced' &&
                  'Assigns to agent with least active conversations'}
                {formData.autoAssignmentType === 'team_based' &&
                  'Assigns based on team availability'}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAutoAssignment}
                disabled={saving}
              >
                Save Auto-Assignment
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InboxSettings;
