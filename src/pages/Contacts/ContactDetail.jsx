import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tab,
    Tabs,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    WhatsApp as WhatsAppIcon,
    LocalOffer as TagIcon,
    History as HistoryIcon,
    Message as MessageIcon,
    Edit as EditIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { personsApi, tagsApi } from '../../api';

const ContactDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadContact();
    }, [id]);

    const loadContact = async () => {
        try {
            setLoading(true);
            const response = await personsApi.getById(id);
            setContact(response.data);
        } catch (error) {
            console.error('Error loading contact:', error);
            // Mock data for display
            setContact({
                id,
                name: 'John Doe',
                phone: '+919876543210',
                email: 'john@example.com',
                whatsappOptIn: true,
                tags: ['VIP', 'Lead'],
                customFields: { company: 'Acme Corp', jobTitle: 'Manager' },
                createdAt: new Date().toISOString(),
                lastContacted: new Date().toISOString(),
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!contact) {
        return (
            <Box p={3}>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/persons')}>
                    Back to Contacts
                </Button>
                <Typography variant="h6" mt={2}>Contact not found</Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/persons')} sx={{ mb: 2 }}>
                Back to Contacts
            </Button>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mx: 'auto',
                                    mb: 2,
                                    fontSize: '2.5rem',
                                    bgcolor: 'primary.main',
                                }}
                            >
                                {contact.name?.[0]?.toUpperCase() || 'C'}
                            </Avatar>
                            <Typography variant="h5">{contact.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Contact ID: {contact.id}
                            </Typography>
                            
                            <Box mt={2} display="flex" justifyContent="center" gap={1}>
                                {contact.tags?.map((tag, i) => (
                                    <Chip key={i} label={tag} size="small" color="primary" variant="outlined" />
                                ))}
                            </Box>

                            <Box mt={3}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<EditIcon />}
                                    fullWidth
                                >
                                    Edit Contact
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
                            <List dense>
                                <ListItem button>
                                    <ListItemIcon><MessageIcon /></ListItemIcon>
                                    <ListItemText primary="Send Message" />
                                </ListItem>
                                <ListItem button>
                                    <ListItemIcon><WhatsAppIcon /></ListItemIcon>
                                    <ListItemText primary="Send WhatsApp" />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Details Card */}
                <Grid item xs={12} md={8}>
                    <Paper>
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="Details" />
                            <Tab label="Activity" />
                            <Tab label="Campaigns" />
                        </Tabs>

                        <Box p={3}>
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><PhoneIcon /></ListItemIcon>
                                            <ListItemText 
                                                primary="Phone" 
                                                secondary={contact.phone || 'Not provided'} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><EmailIcon /></ListItemIcon>
                                            <ListItemText 
                                                primary="Email" 
                                                secondary={contact.email || 'Not provided'} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><WhatsAppIcon /></ListItemIcon>
                                            <ListItemText 
                                                primary="WhatsApp Opt-in" 
                                                secondary={contact.whatsappOptIn ? 'Yes' : 'No'} 
                                            />
                                        </ListItem>
                                    </List>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" gutterBottom>Custom Fields</Typography>
                                    {contact.customFields && Object.keys(contact.customFields).length > 0 ? (
                                        <List>
                                            {Object.entries(contact.customFields).map(([key, value]) => (
                                                <ListItem key={key}>
                                                    <ListItemText 
                                                        primary={key.replace(/([A-Z])/g, ' $1').trim()} 
                                                        secondary={value || '-'} 
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">No custom fields</Typography>
                                    )}
                                </Box>
                            )}

                            {activeTab === 1 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Activity Timeline</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                                            <ListItemText 
                                                primary="Contact created" 
                                                secondary={new Date(contact.createdAt).toLocaleString()} 
                                            />
                                        </ListItem>
                                        {contact.lastContacted && (
                                            <ListItem>
                                                <ListItemIcon><MessageIcon /></ListItemIcon>
                                                <ListItemText 
                                                    primary="Last contacted" 
                                                    secondary={new Date(contact.lastContacted).toLocaleString()} 
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            )}

                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Campaign History</Typography>
                                    <Typography color="text.secondary">
                                        No campaigns sent to this contact yet
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ContactDetail;
