import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Tag, Spin } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { fetchUserDetail, type UserDTO } from '../services/authService';

/* -- Mock data -- */
const usersMap: Record<string, {
  initials: string;
  avatarColor: string;
  initialColor: string;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  status: string;
  statusColor: string;
  joined: string;
  lastActive: string;
}> = {
  '1': {
    initials: 'JD',
    avatarColor: 'var(--primary-color)',
    initialColor: '#fff',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    roleColor: 'var(--primary-color)',
    status: 'Active',
    statusColor: '#4ade80',
    joined: 'December 15, 2023',
    lastActive: '2 hours ago',
  },
  '2': {
    initials: 'SC',
    avatarColor: '#c4b5fd',
    initialColor: '#111118',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Editor',
    roleColor: '#f4f4f5',
    status: 'Active',
    statusColor: '#4ade80',
    joined: 'November 20, 2023',
    lastActive: '5 minutes ago',
  },
};

export default function UserDetailPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiUser, setApiUser] = useState<UserDTO | null>(null);

  // Try to load user from API, fall back to mock
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = Number(userId);
        if (!Number.isNaN(id)) {
          const res = await fetchUserDetail(id);
          if (!cancelled && res.data) {
            setApiUser(res.data);
          }
        }
      } catch {
        // API not ready — use mock
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Merge API data into mock structure
  const mockUser = usersMap[userId || '1'] ?? usersMap['1'];
  const user = apiUser
    ? {
        ...mockUser,
        name: apiUser.nickname || apiUser.username,
        initials: (apiUser.nickname || apiUser.username).slice(0, 2).toUpperCase(),
        email: apiUser.username,
        role: apiUser.role ?? mockUser.role,
        status: apiUser.status === 'Disabled' ? 'Disabled' : 'Active',
        statusColor: apiUser.status === 'Disabled' ? '#ef4444' : '#4ade80',
        joined: apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : mockUser.joined,
        lastActive: apiUser.lastLoginAt ? new Date(apiUser.lastLoginAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : mockUser.lastActive,
      }
    : mockUser;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: <a onClick={() => navigate('/user-management')}>User Management</a> },
        { title: user.name },
      ]} />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          icon={<Pencil size={16} />}
        >
          Edit
        </Button>
        <Button
          danger
          icon={<Trash2 size={16} />}
        >
          Delete
        </Button>
      </div>
    );
  }, [setBreadcrumbs, setActions, navigate, user.name]);

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* User Info Card */}
        <div
          style={{
            width: 420,
            borderRadius: 12,
            backgroundColor: '#111118',
            border: '1px solid #303030',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Avatar + Name */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: user.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography.Text style={{ fontSize: 24, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: user.initialColor }}>
                {user.initials}
              </Typography.Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography.Text style={{ fontSize: 20, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                {user.name}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{user.email}</Typography.Text>
              <Tag>{user.role}</Tag>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#303030' }} />

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Status</Typography.Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user.statusColor }} />
                <Typography.Text style={{ fontSize: 13, color: user.statusColor }}>{user.status}</Typography.Text>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Joined</Typography.Text>
              <Typography.Text style={{ fontSize: 13 }}>{user.joined}</Typography.Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Last Active</Typography.Text>
              <Typography.Text style={{ fontSize: 13 }}>{user.lastActive}</Typography.Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
