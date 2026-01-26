import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { tagService } from '../../api/services';

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    category: '',
  });

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1',
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagService.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleOpenDialog = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        color: tag.color,
        description: tag.description || '',
        category: tag.category || '',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        color: '#3B82F6',
        description: '',
        category: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        await tagService.update(editingTag.id, formData);
      } else {
        await tagService.create(formData);
      }
      handleCloseDialog();
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await tagService.delete(id);
        loadTags();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  // Group tags by category
  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Tag Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Tag
        </Button>
      </Box>

      {Object.entries(groupedTags).map(([category, categoryTags]) => (
        <Box key={category} mb={3}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {category}
          </Typography>
          <Grid container spacing={2}>
            {categoryTags.map((tag) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: tag.color,
                          mr: 2,
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="h6">{tag.name}</Typography>
                        {tag.description && (
                          <Typography variant="body2" color="text.secondary">
                            {tag.description}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(tag)}>
                          <EditIcon />
                        </IconButton>
                        {!tag.isSystem && (
                          <IconButton size="small" onClick={() => handleDelete(tag.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Tag Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Category (optional)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" gutterBottom>
              Color
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : 'none',
                  }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTag ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagManagement;
