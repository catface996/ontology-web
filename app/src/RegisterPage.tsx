import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Divider, Flex, App } from 'antd';
import { isAuthenticated } from './utils/auth';
import { register } from './services/authService';
import { RequestError } from './utils/request';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/topology" replace />;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ username: email, password, nickname: fullName });
      message.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg =
        err instanceof RequestError
          ? err.message
          : 'Registration failed. Please try again.';
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
          <Typography.Title level={4} style={{ margin: 0, color: '#a1a1aa' }}>Create Account</Typography.Title>
          <Typography.Text type="secondary">Get started with your free account</Typography.Text>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Full Name</Typography.Text>
            <Input
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })); }}
              placeholder="Enter your full name"
              status={errors.fullName ? 'error' : undefined}
              size="large"
              disabled={loading}
            />
            {errors.fullName && <Typography.Text type="danger" style={{ fontSize: 12 }}>{errors.fullName}</Typography.Text>}
          </div>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Email</Typography.Text>
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              placeholder="Enter your email"
              status={errors.email ? 'error' : undefined}
              size="large"
              disabled={loading}
            />
            {errors.email && <Typography.Text type="danger" style={{ fontSize: 12 }}>{errors.email}</Typography.Text>}
          </div>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Password</Typography.Text>
            <Input.Password
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              placeholder="Create a password"
              status={errors.password ? 'error' : undefined}
              size="large"
              disabled={loading}
            />
            {errors.password && <Typography.Text type="danger" style={{ fontSize: 12 }}>{errors.password}</Typography.Text>}
          </div>
          <div>
            <Typography.Text style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Confirm Password</Typography.Text>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
              placeholder="Confirm your password"
              status={errors.confirmPassword ? 'error' : undefined}
              size="large"
              disabled={loading}
            />
            {errors.confirmPassword && <Typography.Text type="danger" style={{ fontSize: 12 }}>{errors.confirmPassword}</Typography.Text>}
          </div>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Create Account
          </Button>
        </form>

        {/* Terms */}
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12, marginTop: 16 }}>
          By signing up, you agree to our{' '}
          <a href="#">Terms</a>
          {' '}and{' '}
          <a href="#">Privacy Policy</a>
        </Typography.Text>

        {/* Divider */}
        <Divider>or</Divider>

        {/* Login Link */}
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Already have an account?{' '}
          <a onClick={() => navigate('/login')} style={{ fontWeight: 600 }}>Sign In</a>
        </Typography.Text>
      </Card>
    </Flex>
  );
}
