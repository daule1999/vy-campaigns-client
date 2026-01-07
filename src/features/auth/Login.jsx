import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, MessageSquare } from 'lucide-react';
import { Box, Paper, Typography, Link as MuiLink, Container } from '@mui/material';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/common';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Sign in to VY Campaigns
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 3, textAlign: 'center', bgcolor: 'rgba(255, 107, 107, 0.1)', p: 1.5, borderRadius: 1 }}>
              {error}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Input
              label="Username"
              type="text"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" loading={loading} fullWidth size="large" sx={{ mt: 1 }}>
              Sign In
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" color="primary" underline="hover" fontWeight={500}>
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
