import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { campaignService } from '../../api/services';

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignService.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'scheduled':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Campaigns</Typography>
      </Box>

      <Card>
        <CardContent>
          <List>
            {campaigns.map((campaign) => (
              <ListItem
                key={campaign.id}
                button
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <ListItemText
                  primary={campaign.name}
                  secondary={
                    <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                      <Chip
                        label={campaign.status}
                        size="small"
                        color={getStatusColor(campaign.status)}
                      />
                      <Typography variant="caption">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption">
                        {campaign.totalContacts} contacts
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CampaignList;
