import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { agentService, roleService } from '../../api/services';

const AgentInvitation = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    roleIds: [],
  });
  const [roles, setRoles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await agentService.invite(formData);
      setShowSuccess(true);
      setFormData({ email: '', name: '', roleIds: [] });
    } catch (error) {
      console.error('Error inviting agent:', error);
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Invite Agent
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Details
              </Typography>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />

              <Autocomplete
                multiple
                options={roles}
                getOptionLabel={(option) => option.name}
                value={roles.filter((r) => formData.roleIds.includes(r.id))}
                onChange={(e, newValue) => {
                  setFormData({
                    ...formData,
                    roleIds: newValue.map((r) => r.id),
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Roles" placeholder="Select roles" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      color="primary"
                    />
                  ))
                }
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={loading || !formData.email || !formData.name}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What happens next?
              </Typography>

              <Typography variant="body2" paragraph>
                1. The agent will receive an email with a temporary password
              </Typography>

              <Typography variant="body2" paragraph>
                2. They can log in and change their password
              </Typography>

              <Typography variant="body2" paragraph>
                3. Access will be granted based on assigned roles
              </Typography>

              <Typography variant="body2" color="text.secondary">
                You can manage agent roles anytime from the agents page.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Invitation sent successfully! The agent will receive an email with login details.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentInvitation;
