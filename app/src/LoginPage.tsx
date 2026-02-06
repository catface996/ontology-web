import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
} from '@mui/material';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      navigate('/domain');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: 420, p: 5 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 48, height: 48, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="white">O</Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">Ontology</Typography>
        </Box>

        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">Welcome Back</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to your account to continue</Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <Box sx={{ textAlign: 'left' }}>
            <Link href="#" underline="hover" variant="body2">Forgot password?</Link>
          </Box>

          <Button type="submit" variant="contained" fullWidth size="large">
            Sign In
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>or</Divider>

        {/* Register Link */}
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Don't have an account?{' '}
          <Link href="#" underline="hover" fontWeight={600}>Sign Up</Link>
        </Typography>
      </Card>
    </Box>
  );
}
