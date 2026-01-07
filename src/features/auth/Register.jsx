import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MessageSquare } from 'lucide-react';
import { Box, Paper, Typography, Link as MuiLink, Container, Alert } from '@mui/material';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/common';

export default function Register() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await register({ username, name, email, password });
      if (result.data?.accessToken) {
        navigate('/');
      } else {
        // Account pending activation
        setSuccess(result.message || 'Registration successful. Your account is pending admin approval.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          width: '100%', 
          borderRadius: 4, 
          border: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, gap: 1 }}>
          <Box sx={{ 
            width: 64, 
            height: 64, 
            bgcolor: 'rgba(37, 211, 102, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'primary.main',
            mb: 2
          }}>
            <MessageSquare size={32} />
          </Box>
          <Typography variant="h4" component="h1" fontWeight={700} align="center">
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Get started with VY Campaigns
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Input
              label="Username"
              type="text"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              autoComplete="username"
            />

            <Input
              label="Full Name"
              type="text"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email (optional)"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <Button type="submit" loading={loading} fullWidth size="large" sx={{ mt: 1 }}>
              Create Account
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" color="primary" underline="hover" fontWeight={500}>
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
