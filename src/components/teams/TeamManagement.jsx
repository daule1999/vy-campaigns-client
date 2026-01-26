import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { teamService, agentService } from '../../api/services';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadTeams();
    loadAgents();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await teamService.getAll();
      setTeams(response.data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await agentService.getAll();
      setAgents(response.data);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const handleOpenDialog = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, description: team.description || '' });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeam(null);
  };

  const handleSave = async () => {
    try {
      if (editingTeam) {
        await teamService.update(editingTeam.id, formData);
      } else {
        await teamService.create(formData);
      }
      handleCloseDialog();
      loadTeams();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamService.delete(teamId);
        loadTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleAddMembers = (team) => {
    setSelectedTeam(team);
    setOpenMemberDialog(true);
  };

  const handleAddMemberToTeam = async (userId) => {
    try {
      await teamService.addMembers(selectedTeam.id, [userId]);
      setOpenMemberDialog(false);
      loadTeams();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await teamService.removeMembers(teamId, [userId]);
      loadTeams();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handlePromoteToLead = async (teamId, userId) => {
    try {
      await teamService.promoteToLead(teamId, userId);
      loadTeams();
    } catch (error) {
      console.error('Error promoting to lead:', error);
    }
  };

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Team Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Team
        </Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6">{team.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(team)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(team.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2">Members ({team.members?.length || 0})</Typography>
                    <Button
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAddMembers(team)}
                    >
                      Add
                    </Button>
                  </Box>

                  {team.members && team.members.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {team.members.map((member) => (
                            <TableRow key={member.userId}>
                              <TableCell>{member.user?.name}</TableCell>
                              <TableCell>
                                {member.isLead ? (
                                  <Chip label="Lead" size="small" color="primary" />
                                ) : (
                                  <Chip label="Member" size="small" />
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setSelectedTeam({ ...team, selectedMember: member });
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No members yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Team Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Team Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member to {selectedTeam?.name}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            {agents.map((agent) => (
              <Box
                key={agent.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={1}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <Box>
                  <Typography>{agent.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {agent.email}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleAddMemberToTeam(agent.id)}
                >
                  Add
                </Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            handlePromoteToLead(selectedTeam.id, selectedTeam.selectedMember.userId);
            setAnchorEl(null);
          }}
        >
          Promote to Lead
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRemoveMember(selectedTeam.id, selectedTeam.selectedMember.userId);
            setAnchorEl(null);
          }}
        >
          Remove from Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamManagement;
