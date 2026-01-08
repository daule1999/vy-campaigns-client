import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Webhook as WebhookIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '24px' }}>
      {value === index && children}
    </div>
  );
}

export default function WhatsAppTesting() {
  const [tabValue, setTabValue] = useState(0);

  // API Testing State
  const [apiConfig, setApiConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    recipientNumber: '',
    messageType: 'template',
    templateName: 'hello_world',
    languageCode: 'en_US',
    textMessage: ''
  });
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);

  // Webhook Testing State
  const [webhookConfig, setWebhookConfig] = useState({
    webhookUrl: '',
    verifyToken: '',
    wabaId: '',
    accessToken: ''
  });
  const [webhookPayload, setWebhookPayload] = useState(JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: '123456789'
          },
          messages: [{
            from: '1234567890',
            id: 'wamid.test_' + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: {
              body: 'Test message from admin panel'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  }, null, 2));
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setApiResult(null);
    setWebhookResult(null);
  };

  // API Testing Functions
  const handleSendMessage = async () => {
    setApiLoading(true);
    setApiResult(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/whatsapp-test/send-message`,
        apiConfig,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setApiResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      setApiResult({
        success: false,
        error: error.response?.data || { error: error.message }
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Webhook Testing Functions
  const handleVerifyWebhook = async () => {
    setWebhookLoading(true);
    setWebhookResult(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/whatsapp-test/verify-webhook`,
        {
          params: {
            webhookUrl: webhookConfig.webhookUrl,
            verifyToken: webhookConfig.verifyToken
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setWebhookResult({
        success: true,
        type: 'verify',
        data: response.data
      });
    } catch (error) {
      setWebhookResult({
        success: false,
        error: error.response?.data || { error: error.message }
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleTestWebhookEvent = async () => {
    setWebhookLoading(true);
    setWebhookResult(null);

    try {
      const payload = JSON.parse(webhookPayload);

      const response = await axios.post(
        `${API_BASE_URL}/api/whatsapp-test/test-webhook`,
        {
          webhookUrl: webhookConfig.webhookUrl,
          eventPayload: payload
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setWebhookResult({
        success: true,
        type: 'event',
        data: response.data
      });
    } catch (error) {
      setWebhookResult({
        success: false,
        error: error.response?.data || {error: error.message }
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleSubscribeWebhook = async () => {
    setWebhookLoading(true);
    setWebhookResult(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/whatsapp-test/subscribe-webhook`,
        {
          wabaId: webhookConfig.wabaId,
          accessToken: webhookConfig.accessToken
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setWebhookResult({
        success: true,
        type: 'subscribe',
        data: response.data
      });
    } catch (error) {
      setWebhookResult({
        success: false,
        error: error.response?.data || { error: error.message }
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleGetSubscriptions = async () => {
    setWebhookLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/whatsapp-test/webhook-subscriptions`,
        {
          params: {
            wabaId: webhookConfig.wabaId,
            accessToken: webhookConfig.accessToken
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSubscriptions(response.data.data);
    } catch (error) {
      setWebhookResult({
        success: false,
        error: error.response?.data || { error: error.message }
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          WhatsApp API Testing (Superadmin)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Test WhatsApp messaging API and webhook configuration with custom credentials
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<MessageIcon />} label="Messaging API" />
            <Tab icon={<WebhookIcon />} label="Webhook Testing" />
          </Tabs>
        </Box>

        {/* Tab 1: Messaging API Testing */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Test the WhatsApp Messaging API by sending messages with custom credentials
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number ID"
                value={apiConfig.phoneNumberId}
                onChange={(e) => setApiConfig({ ...apiConfig, phoneNumberId: e.target.value })}
                placeholder="123456789"
                helperText="From WhatsApp Manager → API Setup"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Access Token"
                type="password"
                value={apiConfig.accessToken}
                onChange={(e) => setApiConfig({ ...apiConfig, accessToken: e.target.value })}
                placeholder="EAABsbCS1iHgBO..."
                helperText="Temporary or permanent access token"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Recipient Number"
                value={apiConfig.recipientNumber}
                onChange={(e) => setApiConfig({ ...apiConfig, recipientNumber: e.target.value })}
                placeholder="919876543210"
                helperText="E.164 format (country code + number, no +)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={apiConfig.messageType}
                  label="Message Type"
                  onChange={(e) => setApiConfig({ ...apiConfig, messageType: e.target.value })}
                >
                  <MenuItem value="template">Template Message</MenuItem>
                  <MenuItem value="text">Text Message (24hr window)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {apiConfig.messageType === 'template' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={apiConfig.templateName}
                    onChange={(e) => setApiConfig({ ...apiConfig, templateName: e.target.value })}
                    placeholder="hello_world"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Language Code"
                    value={apiConfig.languageCode}
                    onChange={(e) => setApiConfig({ ...apiConfig, languageCode: e.target.value })}
                    placeholder="en_US"
                  />
                </Grid>
              </>
            )}

            {apiConfig.messageType === 'text' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Message Text"
                  value={apiConfig.textMessage}
                  onChange={(e) => setApiConfig({ ...apiConfig, textMessage: e.target.value })}
                  placeholder="Hello from WhatsApp API!"
                  helperText="Only works within 24-hour customer service window"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={apiLoading ? <CircularProgress size={20} /> : <SendIcon />}
                onClick={handleSendMessage}
                disabled={apiLoading || !apiConfig.phoneNumberId || !apiConfig.accessToken || !apiConfig.recipientNumber}
                fullWidth
                size="large"
              >
                {apiLoading ? 'Sending...' : 'Send Test Message'}
              </Button>
            </Grid>

            {apiResult && (
              <Grid item xs={12}>
                <Alert severity={apiResult.success ? 'success' : 'error'} icon={apiResult.success ? <CheckCircleIcon /> : <ErrorIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    {apiResult.success ? 'Message Sent Successfully!' : 'Error Sending Message'}
                  </Typography>
                  {apiResult.success ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Message ID:</strong> {apiResult.data.data?.messageId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Recipient:</strong> {apiResult.data.data?.recipient}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Error:</strong> {apiResult.error?.error || apiResult.error?.details?.error?.message}
                      </Typography>
                      {apiResult.error?.details && (
                        <pre style={{ fontSize: '11px', marginTop: '8px', overflow: 'auto' }}>
                          {JSON.stringify(apiResult.error.details, null, 2)}
                        </pre>
                      )}
                    </Box>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 2: Webhook Testing */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Test webhook verification, send test events, and manage subscriptions
              </Alert>
            </Grid>

            {/* Webhook Configuration */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Webhook Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Webhook URL"
                        value={webhookConfig.webhookUrl}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, webhookUrl: e.target.value })}
                        placeholder="https://your-domain.com/webhook"
                        helperText="Your webhook callback URL"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Verify Token"
                        value={webhookConfig.verifyToken}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, verifyToken: e.target.value })}
                        placeholder="your_webhook_verify_token"
                        helperText="WEBHOOK_VERIFY_TOKEN from your .env"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="WhatsApp Business Account ID"
                        value={webhookConfig.wabaId}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, wabaId: e.target.value })}
                        placeholder="123456789012345"
                        helperText="For subscription management"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Access Token"
                        value={webhookConfig.accessToken}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, accessToken: e.target.value })}
                        placeholder="EAABsbCS1iHgBO..."
                        helperText="System user token with whatsapp_business_management permission"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Webhook Actions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Test Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleVerifyWebhook}
                disabled={webhookLoading || !webhookConfig.webhookUrl || !webhookConfig.verifyToken}
              >
                1. Verify Webhook
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleTestWebhookEvent}
                disabled={webhookLoading || !webhookConfig.webhookUrl}
              >
                2. Send Test Event
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSubscribeWebhook}
                disabled={webhookLoading || !webhookConfig.wabaId || !webhookConfig.accessToken}
              >
                3. Subscribe to Webhooks
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGetSubscriptions}
                disabled={webhookLoading || !webhookConfig.wabaId || !webhookConfig.accessToken}
              >
                4. Get Current Subscriptions
              </Button>
            </Grid>

            {/* Event Payload Editor */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={15}
                label="Webhook Event Payload (JSON)"
                value={webhookPayload}
                onChange={(e) => setWebhookPayload(e.target.value)}
                helperText="Edit the webhook event payload to test different scenarios"
                sx={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </Grid>

            {/* Current Subscriptions */}
            {subscriptions && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Current Webhook Subscriptions:
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {subscriptions.subscribedFields.map((field) => (
                      <Chip key={field} label={field} size="small" color="primary" />
                    ))}
                  </Box>
                </Alert>
              </Grid>
            )}

            {/* Webhook Testing Results */}
            {webhookResult && (
              <Grid item xs={12}>
                <Alert severity={webhookResult.success ? 'success' : 'error'}>
                  <Typography variant="subtitle2" gutterBottom>
                    {webhookResult.success ? `✅ ${webhookResult.type} Success` : '❌ Test Failed'}
                  </Typography>
                  <pre style={{ fontSize: '11px', marginTop: '8px', overflow: 'auto', maxHeight: '300px' }}>
                    {JSON.stringify(webhookResult.success ? webhookResult.data : webhookResult.error, null, 2)}
                  </pre>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
