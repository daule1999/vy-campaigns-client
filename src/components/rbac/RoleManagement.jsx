import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Grid,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { roleService, permissionService } from '../../api/services';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [],
  });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const [allPerms, groupedPerms] = await Promise.all([
        permissionService.getAll(),
        permissionService.getByFeature(),
      ]);
      setPermissions(allPerms.data);
      setGroupedPermissions(groupedPerms.data);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions?.map(p => p.id) || [],
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissionIds: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, formData);
      } else {
        await roleService.create(formData);
      }
      handleCloseDialog();
      loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.delete(roleId);
        loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const toggleFeature = (feature) => {
    const featurePermissions = groupedPermissions[feature] || [];
    const featurePermissionIds = featurePermissions.map(p => p.id);
    const allSelected = featurePermissionIds.every(id =>
      formData.permissionIds.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter(id => !featurePermissionIds.includes(id))
        : [...new Set([...prev.permissionIds, ...featurePermissionIds])],
    }));
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Role Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={6} lg={4} key={role.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6">{role.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                      <EditIcon />
                    </IconButton>
                    {!role.isSystem && (
                      <IconButton size="small" onClick={() => handleDelete(role.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {role.permissions?.length || 0} permissions
                </Typography>
                <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                  {role.permissions?.slice(0, 5).map((perm) => (
                    <Chip key={perm.id} label={perm.name} size="small" />
                  ))}
                  {role.permissions?.length > 5 && (
                    <Chip label={`+${role.permissions.length - 5} more`} size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom>
              Permissions
            </Typography>

            {Object.entries(groupedPermissions).map(([feature, perms]) => (
              <Accordion key={feature}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Checkbox
                      checked={perms.every(p => formData.permissionIds.includes(p.id))}
                      indeterminate={
                        perms.some(p => formData.permissionIds.includes(p.id)) &&
                        !perms.every(p => formData.permissionIds.includes(p.id))
                      }
                      onChange={() => toggleFeature(feature)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Typography>{feature}</Typography>
                    <Chip
                      label={
                        perms.filter(p => formData.permissionIds.includes(p.id)).length +
                        '/' +
                        perms.length
                      }
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {perms.map((perm) => (
                      <FormControlLabel
                        key={perm.id}
                        control={
                          <Checkbox
                            checked={formData.permissionIds.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">{perm.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {perm.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
