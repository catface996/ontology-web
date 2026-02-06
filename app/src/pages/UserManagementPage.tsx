import { useState } from 'react';
import {
  Box, Breadcrumbs, Typography, Button, TextField, InputAdornment, IconButton,
} from '@mui/material';
import {
  ChevronRight, Plus, Search, Ellipsis,
} from 'lucide-react';

/* ── Types ── */
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

/* ── Config ── */
const roleColors: Record<UserRole, string> = {
  Admin: '#8b5cf6',
  Editor: '#f4f4f5',
  Viewer: '#a1a1aa',
};

const statusConfig: Record<UserStatus, { color: string }> = {
  Active: { color: '#4ade80' },
  Offline: { color: '#a1a1aa' },
};

/* ── Mock data ── */
const users: UserItem[] = [
  { initials: 'JD', avatarColor: '#8b5cf6', initialColor: '#fff',    name: 'John Doe',      joined: 'Joined Dec 2023', email: 'john.doe@company.com',   role: 'Admin',  status: 'Active' },
  { initials: 'SC', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Sarah Chen',    joined: 'Joined Nov 2023', email: 'sarah.chen@company.com', role: 'Editor', status: 'Active' },
  { initials: 'MJ', avatarColor: '#4ade80', initialColor: '#111118', name: 'Mike Johnson',  joined: 'Joined Oct 2023', email: 'mike.j@company.com',     role: 'Viewer', status: 'Offline' },
  { initials: 'EW', avatarColor: '#8b5cf6', initialColor: '#fff',    name: 'Emily Wang',    joined: 'Joined Sep 2023', email: 'emily.wang@company.com',  role: 'Admin',  status: 'Active' },
  { initials: 'AL', avatarColor: '#22d3ee', initialColor: '#111118', name: 'Alex Lee',      joined: 'Joined Aug 2023', email: 'alex.lee@company.com',    role: 'Editor', status: 'Active' },
  { initials: 'RK', avatarColor: '#f472b6', initialColor: '#fff',    name: 'Rachel Kim',    joined: 'Joined Jul 2023', email: 'rachel.k@company.com',    role: 'Viewer', status: 'Offline' },
  { initials: 'DM', avatarColor: '#4ade80', initialColor: '#111118', name: 'David Miller',  joined: 'Joined Jun 2023', email: 'david.m@company.com',     role: 'Admin',  status: 'Active' },
  { initials: 'LZ', avatarColor: '#c4b5fd', initialColor: '#111118', name: 'Lisa Zhang',    joined: 'Joined May 2023', email: 'lisa.z@company.com',      role: 'Editor', status: 'Active' },
];

const stats = [
  { label: 'Total Users',     value: '156', color: '#f4f4f5' },
  { label: 'Active Now',      value: '42',  color: '#4ade80' },
  { label: 'Admins',          value: '8',   color: '#8b5cf6' },
  { label: 'Pending Invites', value: '12',  color: '#c4b5fd' },
];

/* ── Page ── */
export default function UserManagementPage() {
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Typography color="text.secondary" fontSize={14}>Settings</Typography>
          <Typography color="text.primary" fontWeight={500} fontSize={14}>User Management</Typography>
        </Breadcrumbs>
        <Button variant="contained" size="small" startIcon={<Plus size={16} />}>
          Add User
        </Button>
      </Box>

      {/* Content */}
      <Box flex={1} overflow="auto" p={3} display="flex" flexDirection="column" gap={2.5}>
        {/* Stats Row */}
        <Box display="flex" gap={2}>
          {stats.map((s) => (
            <Box
              key={s.label}
              sx={{
                flex: 1,
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#111118',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography fontSize={13} color="text.secondary">{s.label}</Typography>
              <Typography fontSize={28} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: s.color, mt: 0.5 }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Table Card */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 3,
            bgcolor: '#111118',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Table title + search */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2.5}
            py={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Typography fontSize={16} fontWeight={600}>All Users</Typography>
            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#a1a1aa" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 240,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#1a1a24',
                  fontSize: 14,
                },
              }}
            />
          </Box>

          {/* Column headers */}
          <Box
            display="flex"
            alignItems="center"
            height={48}
            px={2.5}
            sx={{ bgcolor: '#1a1a24', flexShrink: 0 }}
          >
            <Box width={280}><Typography fontSize={12} fontWeight={600} color="#a1a1aa">User</Typography></Box>
            <Box flex={1}><Typography fontSize={12} fontWeight={600} color="#a1a1aa">Email</Typography></Box>
            <Box width={100}><Typography fontSize={12} fontWeight={600} color="#a1a1aa">Role</Typography></Box>
            <Box width={100}><Typography fontSize={12} fontWeight={600} color="#a1a1aa">Status</Typography></Box>
            <Box width={80} textAlign="right"><Typography fontSize={12} fontWeight={600} color="#a1a1aa">Actions</Typography></Box>
          </Box>

          {/* Rows */}
          <Box flex={1} overflow="auto">
            {filtered.map((user, i) => (
              <Box
                key={user.email}
                display="flex"
                alignItems="center"
                height={64}
                px={2.5}
                sx={{
                  bgcolor: i % 2 === 1 ? '#1a1a24' : 'transparent',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {/* User */}
                <Box width={280} display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: user.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: user.initialColor }}>
                      {user.initials}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={14} fontWeight={500}>{user.name}</Typography>
                    <Typography fontSize={12} color="text.secondary">{user.joined}</Typography>
                  </Box>
                </Box>

                {/* Email */}
                <Box flex={1}>
                  <Typography fontSize={14}>{user.email}</Typography>
                </Box>

                {/* Role */}
                <Box width={100}>
                  <Typography fontSize={13} fontWeight={500} sx={{ color: roleColors[user.role] }}>
                    {user.role}
                  </Typography>
                </Box>

                {/* Status */}
                <Box width={100} display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: statusConfig[user.status].color }} />
                  <Typography fontSize={13} sx={{ color: statusConfig[user.status].color }}>
                    {user.status}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box width={80} display="flex" justifyContent="flex-end">
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <Ellipsis size={18} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
