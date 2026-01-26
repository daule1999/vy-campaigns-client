import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { quickReplyService } from '../../api/services';

const QuickReplies = () => {
  const [quickReplies, setQuickReplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    isGlobal: false,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadQuickReplies();
    loadCategories();
  }, []);

  const loadQuickReplies = async () => {
    try {
      const response = await quickReplyService.getAll({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setQuickReplies(response.data);
    } catch (error) {
      console.error('Error loading quick replies:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await quickReplyService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleOpenDialog = (reply = null) => {
    if (reply) {
      setEditingReply(reply);
      setFormData({
        title: reply.title,
        content: reply.content,
        category: reply.category || '',
        isGlobal: reply.isGlobal,
      });
    } else {
      setEditingReply(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        isGlobal: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReply(null);
  };

  const handleSave = async () => {
    try {
      if (editingReply) {
        await quickReplyService.update(editingReply.id, formData);
      } else {
        await quickReplyService.create(formData);
      }
      handleCloseDialog();
      loadQuickReplies();
    } catch (error) {
      console.error('Error saving quick reply:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quick reply?')) {
      try {
        await quickReplyService.delete(id);
        loadQuickReplies();
      } catch (error) {
        console.error('Error deleting quick reply:', error);
      }
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const filteredReplies =
    selectedCategory === 'all'
      ? quickReplies
      : quickReplies.filter((r) => r.category === selectedCategory);

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Quick Replies</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Quick Reply
        </Button>
      </Box>

      {/* Category Filter */}
      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quick Replies Grid */}
      <Grid container spacing={2}>
        {filteredReplies.map((reply) => (
          <Grid item xs={12} md={6} lg={4} key={reply.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6">{reply.title}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleCopy(reply.content)}>
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(reply)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(reply.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {reply.content}
                </Typography>

                <Box display="flex" gap={1}>
                  {reply.category && (
                    <Chip label={reply.category} size="small" />
                  )}
                  {reply.isGlobal && (
                    <Chip label="Global" size="small" color="primary" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReply ? 'Edit Quick Reply' : 'Create Quick Reply'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your quick reply message here..."
              helperText="Use {{contact.name}} for personalization"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Category (optional)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingReply ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickReplies;
