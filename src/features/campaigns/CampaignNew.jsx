import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Box, Typography, Stack, Autocomplete, TextField } from '@mui/material';
import { campaignsApi, templatesApi } from '../../api';
import { Button, Input, Card } from '../../components/common';

export default function CampaignNew() {
  const [formData, setFormData] = useState({ name: '', description: '', template_id: '' });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    templatesApi.getAll().then(({ data }) => setTemplates(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await campaignsApi.create({
        ...formData,
        template_id: selectedTemplate?.id || null
      });
      navigate(`/campaigns/${data.data.id}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Create Campaign
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set up a new messaging campaign
        </Typography>
      </Box>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Input
                label="Campaign Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., January Promotion"
                required
              />
              
              <Input
                label="Description (optional)"
                type="textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Campaign description..."
              />
              
              <Autocomplete
                options={templates}
                getOptionLabel={(option) => `${option.name} ${option.waTemplateName ? `(${option.waTemplateName})` : ''}`}
                value={selectedTemplate}
                onChange={(e, newValue) => setSelectedTemplate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Template"
                    placeholder="Search templates..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.waTemplateName} • {option.languageCode}
                      </Typography>
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="secondary" onClick={() => navigate('/campaigns')}>Cancel</Button>
                <Button type="submit" startIcon={<Save size={18} />} loading={saving}>Create Campaign</Button>
              </Box>
            </Stack>
          </form>
        </Card.Body>
      </Card>
    </Box>
  );
}

