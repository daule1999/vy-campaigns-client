import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Drawer,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { workflowService } from '../../api/services';

const nodeTypes = {
  trigger: { label: 'Trigger', color: '#6366F1' },
  send_text: { label: 'Send Text', color: '#8B5CF6' },
  send_interactive_list: { label: 'Interactive List', color: '#A855F7' },
  send_interactive_buttons: { label: 'Interactive Buttons', color: '#C084FC' },
  condition: { label: 'Condition', color: '#F59E0B' },
  wait_for_reply: { label: 'Wait for Reply', color: '#10B981' },
  delay: { label: 'Delay', color: '#06B6D4' },
  assign_agent: { label: 'Assign Agent', color: '#EF4444' },
  assign_team: { label: 'Assign Team', color: '#F87171' },
  add_tag: { label: 'Add Tag', color: '#EC4899' },
  end: { label: 'End', color: '#64748B' },
};

const WorkflowBuilder = ({ workflowId }) => {
  const [workflow, setWorkflow] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      const response = await workflowService.getById(workflowId);
      const workflowData = response.data;
      setWorkflow(workflowData);

      // Convert workflow nodes to React Flow format
      const flowNodes = workflowData.nodes.map((node) => ({
        id: node.nodeId,
        type: 'default',
        data: {
          label: (
            <Box>
              <Typography variant="caption" display="block">
                {nodeTypes[node.nodeType]?.label || node.nodeType}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {getNodePreview(node)}
              </Typography>
            </Box>
          ),
          nodeType: node.nodeType,
          config: node.config,
        },
        position: node.position || { x: 100, y: 100 },
        style: {
          backgroundColor: nodeTypes[node.nodeType]?.color || '#64748B',
          color: 'white',
          border: '2px solid white',
          borderRadius: 8,
          padding: 10,
          minWidth: 150,
        },
      }));

      const flowEdges = workflowData.edges.map((edge) => ({
        id: `${edge.sourceNodeId}-${edge.targetNodeId}`,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.label,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const getNodePreview = (node) => {
    switch (node.nodeType) {
      case 'send_text':
        return node.config?.text?.substring(0, 30) + '...' || 'Text message';
      case 'send_interactive_list':
        return `List: ${node.config?.title || 'Options'}`;
      case 'send_interactive_buttons':
        return `${node.config?.buttons?.length || 0} buttons`;
      case 'condition':
        return `If ${node.config?.field || 'condition'}`;
      case 'wait_for_reply':
        return `Wait ${node.config?.timeout || 300}s`;
      case 'delay':
        return `Delay ${node.config?.seconds || 5}s`;
      case 'assign_agent':
        return `Assign to agent`;
      case 'add_tag':
        return `Add tag: ${node.config?.tagName || ''}`;
      default:
        return node.nodeType;
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!workflow) return;

    try {
      setSaving(true);

      // Convert React Flow nodes back to workflow format
      const workflowNodes = nodes.map((node) => ({
        nodeId: node.id,
        nodeType: node.data.nodeType,
        config: node.data.config,
        position: node.position,
      }));

      const workflowEdges = edges.map((edge) => ({
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        label: edge.label,
      }));

      await workflowService.update(workflowId, {
        nodes: workflowNodes,
        edges: workflowEdges,
      });

      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    try {
      await workflowService.activate(workflowId);
      loadWorkflow();
      alert('Workflow activated!');
    } catch (error) {
      console.error('Error activating workflow:', error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await workflowService.deactivate(workflowId);
      loadWorkflow();
      alert('Workflow deactivated!');
    } catch (error) {
      console.error('Error deactivating workflow:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {workflow?.name || 'Workflow Builder'}
        </Typography>
        <Box display="flex" gap={1}>
          {workflow?.isActive ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleDeactivate}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="success"
              startIcon={<PlayIcon />}
              onClick={handleActivate}
            >
              Activate
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={saving ? null : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Paper>

      {/* Canvas */}
      <Box sx={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>

      {/* Node Configuration Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Node Configuration</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedNode && (
            <Box>
              <Chip
                label={nodeTypes[selectedNode.data.nodeType]?.label || selectedNode.data.nodeType}
                sx={{
                  backgroundColor: nodeTypes[selectedNode.data.nodeType]?.color,
                  color: 'white',
                  mb: 2,
                }}
              />

              <Divider sx={{ my: 2 }} />

              {/* Node-specific configuration fields */}
              {selectedNode.data.nodeType === 'send_text' && (
                <TextField
                  fullWidth
                  label="Message Text"
                  multiline
                  rows={4}
                  value={selectedNode.data.config?.text || ''}
                  onChange={(e) => {
                    const updatedNode = {
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        config: { ...selectedNode.data.config, text: e.target.value },
                      },
                    };
                    setSelectedNode(updatedNode);
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id ? updatedNode : node
                      )
                    );
                  }}
                />
              )}

              {selectedNode.data.nodeType === 'delay' && (
                <TextField
                  fullWidth
                  label="Delay (seconds)"
                  type="number"
                  value={selectedNode.data.config?.seconds || 5}
                  onChange={(e) => {
                    const updatedNode = {
                      ...selectedNode,
                      data: {
                        ...selectedNode.data,
                        config: { ...selectedNode.data.config, seconds: parseInt(e.target.value) },
                      },
                    };
                    setSelectedNode(updatedNode);
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id ? updatedNode : node
                      )
                    );
                  }}
                />
              )}

              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Node ID: {selectedNode.id}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default WorkflowBuilder;
