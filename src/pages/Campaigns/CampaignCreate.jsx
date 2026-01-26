import React from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CampaignCreate = () => {
    const navigate = useNavigate();

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Create Campaign</Typography>
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>New Campaign Details</Typography>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
                    <TextField label="Campaign Name" fullWidth placeholder="e.g. Winter Sale 2026" />
                    <TextField select label="Select Template" fullWidth defaultValue="">
                        <MenuItem value="">Select a template</MenuItem>
                    </TextField>
                    <TextField select label="Select Audience (Contact Tag)" fullWidth defaultValue="">
                        <MenuItem value="">Select a tag</MenuItem>
                    </TextField>
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={() => navigate('/campaigns')}>
                            Create & Launch
                        </Button>
                        <Button variant="text" sx={{ ml: 2 }} onClick={() => navigate('/campaigns')}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default CampaignCreate;
