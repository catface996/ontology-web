import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Input, Tag, Card, Button, Checkbox, Flex, Divider } from 'antd';
import {
  Share2, Search, Globe, Landmark,
  Wallet, Plug, ArrowRight, ChevronDown, ChevronUp, Bell, Check, LogOut,
} from 'lucide-react';
import { logout, getAuth } from './utils/auth';

interface Domain {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stats: { classes: number; relations: number; instances: string };
}

const domains: Domain[] = [
  { id: 'enterprise', title: 'Enterprise', description: 'Corporate structures, business processes, and organizational hierarchies.', icon: <Globe size={24} />, color: 'var(--primary-color)', stats: { classes: 156, relations: 89, instances: '12.4K' } },
  { id: 'healthcare', title: 'Healthcare', description: 'Medical terminologies, patient records, and clinical workflows.', icon: <Landmark size={24} />, color: '#22D3EE', stats: { classes: 234, relations: 156, instances: '45.2K' } },
  { id: 'finance', title: 'Finance', description: 'Financial instruments, transactions, and regulatory compliance.', icon: <Wallet size={24} />, color: '#F472B6', stats: { classes: 189, relations: 112, instances: '28.7K' } },
  { id: 'iot', title: 'IoT & Sensors', description: 'Device telemetry, sensor networks, and real-time data streams.', icon: <Plug size={24} />, color: '#4ADE80', stats: { classes: 98, relations: 67, instances: '156K' } },
];

export default function DomainSelection() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [selected, setSelected] = useState<string[]>(['enterprise']);
  const [filter, setFilter] = useState('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const toggleDomain = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #27273a' }}>
        <Flex align="center" gap={12}>
          <Share2 size={28} color="var(--primary-color)" />
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>Ontology</Typography.Title>
        </Flex>
        <Flex align="center" gap={12}>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} color="#a1a1aa" />
          </div>
          <Flex
            align="center"
            gap={10}
            style={{ cursor: 'pointer' }}
            onClick={() => setUserMenuOpen((prev) => !prev)}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--primary-color)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                {auth?.user?.name?.[0] || 'A'}
              </Typography.Text>
            </div>
            <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>
              {auth?.user?.name || 'Admin User'}
            </Typography.Text>
            {userMenuOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Flex>
        </Flex>
      </Flex>

      {/* User Menu Popover */}
      {userMenuOpen && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 24, zIndex: 1300,
              width: 248, background: '#1a1a24',
              border: '1px solid #27273a', borderRadius: 12, padding: '8px 0',
            }}
          >
            {/* User Info */}
            <Flex align="center" gap={12} style={{ padding: '12px 16px' }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary-color)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {auth?.user?.name?.[0] || 'A'}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                  {auth?.user?.name || 'Admin User'}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', display: 'block' }}>
                  {auth?.user?.email || 'admin@ontology.io'}
                </Typography.Text>
              </div>
            </Flex>
            <Divider style={{ margin: '0 8px' }} />

            {/* Language */}
            <div style={{ padding: '8px 16px' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Language</Typography.Text>
            </div>
            {(['English', '中文', '日本語'] as const).map((lang) => {
              const isActive = selectedLanguage === lang;
              return (
                <Flex
                  key={lang}
                  align="center"
                  gap={12}
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(var(--primary-rgb), 0.13)' : 'transparent',
                  }}
                >
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isActive && <Check size={14} color="var(--primary-color)" />}
                  </div>
                  <Globe size={14} color="#a1a1aa" />
                  <Typography.Text style={{ fontSize: 13 }}>{lang}</Typography.Text>
                </Flex>
              );
            })}
            <Divider style={{ margin: '0 8px' }} />

            {/* Logout */}
            <Flex
              align="center"
              gap={12}
              onClick={() => { logout(); navigate('/login'); }}
              style={{
                padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <LogOut size={14} color="#f87171" />
              <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#f87171' }}>Log out</Typography.Text>
            </Flex>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Flex vertical align="center" gap={40} style={{ flex: 1, padding: 48 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', maxWidth: 600 }}>
          <Typography.Title level={3} style={{ fontWeight: 700 }}>Select Your Domains</Typography.Title>
          <Typography.Text type="secondary">Choose one or more business domains to manage your knowledge graphs. You can switch between domains at any time.</Typography.Text>
        </div>

        {/* Search & Filter */}
        <Flex align="center" justify="space-between" style={{ width: '100%', maxWidth: 1200 }}>
          <Input
            placeholder="Search domains..."
            prefix={<Search size={16} />}
            style={{ width: 320 }}
          />
          <Flex gap={8}>
            {['All', 'Recent', 'Favorites'].map((label) => (
              <Tag
                key={label}
                onClick={() => setFilter(label.toLowerCase())}
                color={filter === label.toLowerCase() ? 'purple' : undefined}
                style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 16 }}
              >
                {label}
              </Tag>
            ))}
          </Flex>
        </Flex>

        {/* Domain Cards */}
        <Flex gap={24} wrap="wrap" justify="center">
          {domains.map((domain) => {
            const isSelected = selected.includes(domain.id);
            return (
              <Card
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                style={{
                  width: 280,
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? 'var(--primary-color)' : '#27273a'}`,
                  boxShadow: isSelected ? `0 8px 24px ${domain.color}30` : undefined,
                }}
              >
                <Flex vertical gap={16} style={{ height: '100%' }}>
                  <Flex justify="space-between" align="flex-start">
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${domain.color}20`, color: domain.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {domain.icon}
                    </div>
                    <Checkbox checked={isSelected} />
                  </Flex>
                  <div style={{ flex: 1 }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>{domain.title}</Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>{domain.description}</Typography.Text>
                  </div>
                  <Flex gap={16}>
                    <div><Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Classes</Typography.Text><Typography.Text strong>{domain.stats.classes}</Typography.Text></div>
                    <div><Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Relations</Typography.Text><Typography.Text strong>{domain.stats.relations}</Typography.Text></div>
                    <div><Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Instances</Typography.Text><Typography.Text strong>{domain.stats.instances}</Typography.Text></div>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>

        {/* Action Bar */}
        <Flex align="center" gap={16}>
          <Typography.Text type="secondary">{selected.length} domain{selected.length !== 1 ? 's' : ''} selected</Typography.Text>
          <Button type="primary" size="large" icon={<ArrowRight size={16} />} iconPosition="end" onClick={() => navigate('/knowledge-graph')} disabled={selected.length === 0}>
            Enter Workspace
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
