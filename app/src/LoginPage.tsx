import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Divider, Flex, App } from 'antd';
import { login, isAuthenticated } from './utils/auth';
import { RequestError } from './utils/request';

export default function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/select-ontology" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      await login({ username, password });
      navigate('/select-ontology');
    } catch (err) {
      const msg =
        err instanceof RequestError
          ? err.message
          : 'Login failed. Please try again.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Card style={{ width: 420, padding: 20, background: '#0d0d14', border: '1px solid #27273a', borderRadius: 16 }}>
        {/* Logo */}
        <Flex align="center" justify="center" gap={12} style={{ marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: 'var(--primary-color)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>O</Typography.Title>
          </div>
          <Typography.Title level={4} style={{ margin: 0, color: '#a1a1aa' }}>Ontology</Typography.Title>
        </Flex>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Typography.Title level={4} style={{ margin: 0, color: '#a1a1aa' }}>Welcome Back</Typography.Title>
          <Typography.Text type="secondary">Sign in to your account to continue</Typography.Text>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Username</Typography.Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              size="large"
              disabled={loading}
            />
          </div>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Password</Typography.Text>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              size="large"
              disabled={loading}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <a href="#" style={{ fontSize: 13 }}>Forgot password?</a>
          </div>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <Divider>or</Divider>

        {/* Register Link */}
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Don't have an account?{' '}
          <a onClick={() => navigate('/register')} style={{ fontWeight: 600 }}>Sign Up</a>
        </Typography.Text>
      </Card>
    </Flex>
  );
}
