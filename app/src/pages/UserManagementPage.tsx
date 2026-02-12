import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Input } from 'antd';
import { Plus, Search, Ellipsis } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type UserRole = 'Admin' | 'Editor' | 'Viewer';
type UserStatus = 'Active' | 'Offline';

interface UserItem {
  initials: string;
  avatarColor: string;
  initialColor: string;
  name: string;
  joined: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/* -- Config -- */
const roleColors: Record<UserRole, string> = {
  Admin: 'var(--primary-color)',
  Editor: '#f4f4f5',
  Viewer: '#a1a1aa',
};

const statusConfig: Record<UserStatus, { color: string }> = {
  Active: { color: '#4ade80' },
  Offline: { color: '#a1a1aa' },
};

/* -- Mock data -- */
const users: UserItem[] = [
  { initials: 'JD', avatarColor: 'var(--primary-color)', initialColor: '#fff',    name: 'John Doe',      joined: 'Joined Dec 2023', email: 'john.doe@company.com',   role: 'Admin',  status: 'Active' },
  { initials: 'SC', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Sarah Chen',    joined: 'Joined Nov 2023', email: 'sarah.chen@company.com', role: 'Editor', status: 'Active' },
  { initials: 'MJ', avatarColor: '#4ade80', initialColor: '#111118', name: 'Mike Johnson',  joined: 'Joined Oct 2023', email: 'mike.j@company.com',     role: 'Viewer', status: 'Offline' },
  { initials: 'EW', avatarColor: 'var(--primary-color)', initialColor: '#fff',    name: 'Emily Wang',    joined: 'Joined Sep 2023', email: 'emily.wang@company.com',  role: 'Admin',  status: 'Active' },
  { initials: 'AL', avatarColor: '#22d3ee', initialColor: '#111118', name: 'Alex Lee',      joined: 'Joined Aug 2023', email: 'alex.lee@company.com',    role: 'Editor', status: 'Active' },
  { initials: 'RK', avatarColor: '#f472b6', initialColor: '#fff',    name: 'Rachel Kim',    joined: 'Joined Jul 2023', email: 'rachel.k@company.com',    role: 'Viewer', status: 'Offline' },
  { initials: 'DM', avatarColor: '#4ade80', initialColor: '#111118', name: 'David Miller',  joined: 'Joined Jun 2023', email: 'david.m@company.com',     role: 'Admin',  status: 'Active' },
  { initials: 'LZ', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Lisa Zhang',    joined: 'Joined May 2023', email: 'lisa.z@company.com',      role: 'Editor', status: 'Active' },
];

const stats = [
  { label: 'Total Users',     value: '156', color: '#f4f4f5' },
  { label: 'Active Now',      value: '42',  color: '#4ade80' },
  { label: 'Admins',          value: '8',   color: 'var(--primary-color)' },
  { label: 'Pending Invites', value: '12',  color: '#c4b5fd' },
];

/* -- Page -- */
export default function UserManagementPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'User Management' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<Plus size={16} />}>
        Add User
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 16 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: 20,
                borderRadius: 12,
                backgroundColor: '#111118',
                border: '1px solid #303030',
              }}
            >
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{s.label}</Typography.Text>
              <Typography.Text style={{ fontSize: 28, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: s.color, display: 'block', marginTop: 4 }}>
                {s.value}
              </Typography.Text>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: '#111118',
            border: '1px solid #303030',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Table title + search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #303030',
            }}
          >
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>All Users</Typography.Text>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={16} color="#a1a1aa" />}
              style={{ width: 240, backgroundColor: '#1a1a24', borderRadius: 8, fontSize: 14 }}
            />
          </div>

          {/* Column headers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 48,
              padding: '0 20px',
              backgroundColor: '#1a1a24',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 280 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>User</Typography.Text></div>
            <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Email</Typography.Text></div>
            <div style={{ width: 100 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Role</Typography.Text></div>
            <div style={{ width: 100 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Status</Typography.Text></div>
            <div style={{ width: 80, textAlign: 'right' }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Actions</Typography.Text></div>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map((user, i) => (
              <div
                key={user.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 64,
                  padding: '0 20px',
                  backgroundColor: i % 2 === 1 ? '#1a1a24' : 'transparent',
                  borderBottom: '1px solid #303030',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/user-management/${i + 1}`)}
              >
                {/* User */}
                <div style={{ width: 280, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: user.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography.Text style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: user.initialColor }}>
                      {user.initials}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{user.name}</Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{user.joined}</Typography.Text>
                  </div>
                </div>

                {/* Email */}
                <div style={{ flex: 1 }}>
                  <Typography.Text style={{ fontSize: 14 }}>{user.email}</Typography.Text>
                </div>

                {/* Role */}
                <div style={{ width: 100 }}>
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: roleColors[user.role] }}>
                    {user.role}
                  </Typography.Text>
                </div>

                {/* Status */}
                <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusConfig[user.status].color }} />
                  <Typography.Text style={{ fontSize: 13, color: statusConfig[user.status].color }}>
                    {user.status}
                  </Typography.Text>
                </div>

                {/* Actions */}
                <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="text" icon={<Ellipsis size={18} />} size="small" onClick={(e) => e.stopPropagation()} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
