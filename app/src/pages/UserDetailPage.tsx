import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Tag } from 'antd';
import { HeartPulse, Landmark, Layers, Building2, Pencil, Trash2, Plus } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
interface DomainInfo {
  name: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  role: string;
  roleBg: string;
  roleColor: string;
  borderColor: string;
  stats: { label: string; value: string }[];
}

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
  domains: DomainInfo[];
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
    domains: [
      {
        name: 'Enterprise',
        icon: <Building2 size={18} />,
        iconColor: 'var(--primary-color)',
        iconBg: 'var(--primary-color)',
        role: 'Owner',
        roleBg: 'var(--primary-color)',
        roleColor: '#fff',
        borderColor: 'var(--primary-color)',
        stats: [{ label: 'Classes', value: '24' }, { label: 'Relations', value: '156' }],
      },
      {
        name: 'Healthcare',
        icon: <HeartPulse size={18} />,
        iconColor: '#22d3ee',
        iconBg: '#22d3ee20',
        role: 'Editor',
        roleBg: '#1a1a24',
        roleColor: '#f4f4f5',
        borderColor: '#27273a',
        stats: [{ label: 'Classes', value: '18' }, { label: 'Relations', value: '89' }],
      },
      {
        name: 'Finance',
        icon: <Landmark size={18} />,
        iconColor: '#f472b6',
        iconBg: '#f472b620',
        role: 'Viewer',
        roleBg: '#1a1a24',
        roleColor: '#a1a1aa',
        borderColor: '#27273a',
        stats: [{ label: 'Classes', value: '31' }, { label: 'Relations', value: '15' }],
      },
    ],
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
    domains: [
      {
        name: 'Healthcare',
        icon: <HeartPulse size={18} />,
        iconColor: '#22d3ee',
        iconBg: '#22d3ee20',
        role: 'Owner',
        roleBg: '#22d3ee',
        roleColor: '#fff',
        borderColor: '#22d3ee',
        stats: [{ label: 'Classes', value: '18' }, { label: 'Relations', value: '89' }],
      },
    ],
  },
};

export default function UserDetailPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = usersMap[userId || '1'] ?? usersMap['1'];

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

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* User Info Card */}
          <div
            style={{
              width: 360,
              flexShrink: 0,
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

          {/* Assigned Domains Card */}
          <div
            style={{
              flex: 1,
              borderRadius: 12,
              backgroundColor: '#111118',
              border: '1px solid #303030',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Domains Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={20} color="var(--primary-color)" />
                <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                  Assigned Domains
                </Typography.Text>
                <div style={{ backgroundColor: '#1a1a24', borderRadius: 40, padding: '2px 8px' }}>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{user.domains.length}</Typography.Text>
                </div>
              </div>
              <Button
                size="small"
                icon={<Plus size={16} />}
              >
                Add Domain
              </Button>
            </div>

            {/* Domain Cards */}
            <div style={{ display: 'flex', gap: 12 }}>
              {user.domains.map((d) => (
                <div
                  key={d.name}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    backgroundColor: '#1a1a24',
                    border: `2px solid ${d.borderColor}`,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {/* Domain header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: d.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: d.iconColor,
                        }}
                      >
                        {d.icon}
                      </div>
                      <Typography.Text style={{ fontSize: 15, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                        {d.name}
                      </Typography.Text>
                    </div>
                    <div
                      style={{
                        backgroundColor: d.roleBg,
                        borderRadius: 100,
                        padding: '4px 10px',
                        border: d.roleBg === '#1a1a24' ? '1px solid #303030' : 'none',
                      }}
                    >
                      <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: d.roleColor }}>
                        {d.role}
                      </Typography.Text>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    {d.stats.map((s) => (
                      <div key={s.label}>
                        <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', display: 'block' }}>
                          {s.value}
                        </Typography.Text>
                        <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
