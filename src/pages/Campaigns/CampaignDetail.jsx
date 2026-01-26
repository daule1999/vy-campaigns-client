import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import CampaignAnalyticsDashboard from '../../components/campaigns/CampaignAnalyticsDashboard';

const CampaignDetail = () => {
  const { id } = useParams();

  return (
    <Box p={3}>
      <CampaignAnalyticsDashboard campaignId={id} />
    </Box>
  );
};

export default CampaignDetail;
