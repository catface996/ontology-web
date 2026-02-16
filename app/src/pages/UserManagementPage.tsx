import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Input, Spin } from 'antd';
import { Plus, Search, Ellipsis } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { fetchUsers, type UserDTO } from '../services/authService';

/* -- Types -- */
type UserRole = 'Admin' | 'Editor' | 'Viewer';
type UserStatus = 'Active' | 'Offline';

/* -- Config -- */
const roleColors: Record<string, string> = {
  Admin: 'var(--primary-color)',
  Editor: '#f4f4f5',
  Viewer: '#a1a1aa',
};

const statusConfig: Record<string, { color: string }> = {
  Active: { color: '#4ade80' },
  Offline: { color: '#a1a1aa' },
  Disabled: { color: '#ef4444' },
};

/* -- Mock data (fallback when API unavailable) -- */
interface MockUser {
  id: number;
  initials: string;
  avatarColor: string;
  initialColor: string;
  name: string;
  joined: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

const MOCK_USERS: MockUser[] = [
  { id: 1, initials: 'JD', avatarColor: 'var(--primary-color)', initialColor: '#fff',    name: 'John Doe',      joined: 'Joined Dec 2023', email: 'john.doe@company.com',   role: 'Admin',  status: 'Active' },
  { id: 2, initials: 'SC', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Sarah Chen',    joined: 'Joined Nov 2023', email: 'sarah.chen@company.com', role: 'Editor', status: 'Active' },
  { id: 3, initials: 'MJ', avatarColor: '#4ade80', initialColor: '#111118', name: 'Mike Johnson',  joined: 'Joined Oct 2023', email: 'mike.j@company.com',     role: 'Viewer', status: 'Offline' },
  { id: 4, initials: 'EW', avatarColor: 'var(--primary-color)', initialColor: '#fff',    name: 'Emily Wang',    joined: 'Joined Sep 2023', email: 'emily.wang@company.com',  role: 'Admin',  status: 'Active' },
  { id: 5, initials: 'AL', avatarColor: '#22d3ee', initialColor: '#111118', name: 'Alex Lee',      joined: 'Joined Aug 2023', email: 'alex.lee@company.com',    role: 'Editor', status: 'Active' },
  { id: 6, initials: 'RK', avatarColor: '#f472b6', initialColor: '#fff',    name: 'Rachel Kim',    joined: 'Joined Jul 2023', email: 'rachel.k@company.com',    role: 'Viewer', status: 'Offline' },
  { id: 7, initials: 'DM', avatarColor: '#4ade80', initialColor: '#111118', name: 'David Miller',  joined: 'Joined Jun 2023', email: 'david.m@company.com',     role: 'Admin',  status: 'Active' },
  { id: 8, initials: 'LZ', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Lisa Zhang',    joined: 'Joined May 2023', email: 'lisa.z@company.com',      role: 'Editor', status: 'Active' },
];

/* Avatar color palette for API-sourced users */
const AVATAR_COLORS = ['var(--primary-color)', '#c4b5fd', '#4ade80', '#22d3ee', '#f472b6', '#fbbf24'];

function dtoToDisplay(dto: UserDTO, index: number): MockUser {
  const name = dto.nickname || dto.username;
  const initials = name.slice(0, 2).toUpperCase();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const createdDate = dto.createdAt ? new Date(dto.createdAt) : null;
  const joined = createdDate
    ? `Joined ${createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : '';
  return {
    id: dto.id,
    initials,
    avatarColor,
    initialColor: avatarColor === 'var(--primary-color)' || avatarColor === '#f472b6' ? '#fff' : '#111118',
    name,
    joined,
    email: dto.username,
    role: (dto.role ?? 'Viewer') as UserRole,
    status: dto.status === 'Disabled' ? 'Offline' : 'Active',
  };
}

/* -- Page -- */
export default function UserManagementPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<MockUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadUsers = useCallback(async (p: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await fetchUsers({ page: p, size: pageSize, username: keyword || undefined });
      if (res.data && res.data.records.length > 0) {
        setUsers(res.data.records.map(dtoToDisplay));
        setTotal(res.data.total);
      } else {
        setUsers(MOCK_USERS);
        setTotal(MOCK_USERS.length);
      }
    } catch {
      setUsers(MOCK_USERS);
      setTotal(MOCK_USERS.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers(page, search);
  }, [page, loadUsers]);

  // Debounced search: reset to page 1 on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      void loadUsers(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

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

  /* Stats derived from API data */
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;

  const stats = [
    { label: 'Total Users',     value: String(total), color: '#f4f4f5' },
    { label: 'Active Now',      value: String(activeCount), color: '#4ade80' },
    { label: 'Admins',          value: String(adminCount), color: 'var(--primary-color)' },
    { label: 'Pending Invites', value: '0', color: '#c4b5fd' },
  ];

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
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
            ) : (
              users.map((user, i) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 64,
                    padding: '0 20px',
                    backgroundColor: i % 2 === 1 ? '#1a1a24' : 'transparent',
                    borderBottom: '1px solid #303030',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/user-management/${user.id}`)}
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
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: roleColors[user.role] ?? '#a1a1aa' }}>
                      {user.role}
                    </Typography.Text>
                  </div>

                  {/* Status */}
                  <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: (statusConfig[user.status] ?? statusConfig.Offline).color }} />
                    <Typography.Text style={{ fontSize: 13, color: (statusConfig[user.status] ?? statusConfig.Offline).color }}>
                      {user.status}
                    </Typography.Text>
                  </div>

                  {/* Actions */}
                  <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="text" icon={<Ellipsis size={18} />} size="small" onClick={(e) => e.stopPropagation()} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
