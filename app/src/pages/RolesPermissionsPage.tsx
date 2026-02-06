import { useState } from 'react';
import {
  Box, Breadcrumbs, Typography, Button,
} from '@mui/material';
import {
  ChevronRight, ChevronLeft, Plus, Shield, Pencil, Eye, Check, Minus,
} from 'lucide-react';

/* ── Types ── */
interface RoleCard {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  members: number;
  description: string;
}

interface PermissionRow {
  label: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

interface PermissionSection {
  title: string;
  rows: PermissionRow[];
}

/* ── Data ── */
const roles: RoleCard[] = [
  { name: 'Admin',  icon: Shield, iconColor: '#8b5cf6', members: 8,   description: 'Full system access with all administrative privileges including user management and configuration.' },
  { name: 'Editor', icon: Pencil, iconColor: '#22d3ee', members: 24,  description: 'Can create and edit ontology classes, relations, properties, and instances within assigned domains.' },
  { name: 'Viewer', icon: Eye,    iconColor: '#4ade80', members: 124, description: 'Read-only access to ontology data, knowledge graphs, and reports. Cannot modify any content.' },
];

const permissionSections: PermissionSection[] = [
  {
    title: 'Ontology Management',
    rows: [
      { label: 'Create classes & relations',  admin: true,  editor: true,  viewer: false },
      { label: 'Edit properties & instances',  admin: true,  editor: true,  viewer: false },
      { label: 'View knowledge graph',         admin: true,  editor: true,  viewer: true },
    ],
  },
  {
    title: 'Tools & Reports',
    rows: [
      { label: 'Execute SPARQL queries',       admin: true,  editor: true,  viewer: false },
      { label: 'Import & export data',         admin: true,  editor: true,  viewer: false },
      { label: 'View reports & analytics',     admin: true,  editor: true,  viewer: true },
    ],
  },
  {
    title: 'Administration',
    rows: [
      { label: 'Manage users & roles',         admin: true,  editor: false, viewer: false },
      { label: 'Configure integrations',       admin: true,  editor: false, viewer: false },
      { label: 'View audit logs',              admin: true,  editor: false, viewer: false },
    ],
  },
];

const allRows = permissionSections.flatMap((s) =>
  [{ type: 'section' as const, title: s.title }, ...s.rows.map((r) => ({ type: 'row' as const, ...r }))]
);

const PAGE_SIZE = 8;

/* ── Helpers ── */
function PermIcon({ granted }: { granted: boolean }) {
  return granted
    ? <Check size={18} color="#4ade80" />
    : <Minus size={18} color="#a1a1aa" />;
}

/* ── Page ── */
export default function RolesPermissionsPage() {
  const [page, setPage] = useState(1);

  // Flatten for pagination: only count actual permission rows
  const dataRows = permissionSections.flatMap((s) => s.rows);
  const totalPages = Math.max(1, Math.ceil(dataRows.length / PAGE_SIZE));
  const pagedRows = dataRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Rebuild section structure for paged rows
  const pagedSections: { title: string; rows: PermissionRow[] }[] = [];
  for (const section of permissionSections) {
    const matching = section.rows.filter((r) => pagedRows.includes(r));
    if (matching.length > 0) {
      pagedSections.push({ title: section.title, rows: matching });
    }
  }

  let rowIndex = 0;

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
          <Typography color="text.primary" fontWeight={500} fontSize={14}>Roles & Permissions</Typography>
        </Breadcrumbs>
        <Button variant="contained" size="small" startIcon={<Plus size={16} />}>
          Create Role
        </Button>
      </Box>

      {/* Content */}
      <Box flex={1} overflow="auto" p={3} display="flex" flexDirection="column" gap={2.5}>
        {/* Role Cards */}
        <Box display="flex" gap={2}>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Box
                key={role.name}
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#111118',
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        bgcolor: `${role.iconColor}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} color={role.iconColor} />
                    </Box>
                    <Typography fontSize={16} fontWeight={600} fontFamily="JetBrains Mono, monospace">
                      {role.name}
                    </Typography>
                  </Box>
                  <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1.5, bgcolor: `${role.iconColor}20` }}>
                    <Typography fontSize={12} fontWeight={500} sx={{ color: role.iconColor }}>
                      {role.members} members
                    </Typography>
                  </Box>
                </Box>
                <Typography fontSize={13} color="text.secondary" lineHeight={1.5}>
                  {role.description}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Permission Matrix Table */}
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
          {/* Table title */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2.5}
            py={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Typography fontSize={16} fontWeight={600} fontFamily="JetBrains Mono, monospace">
              Permission Matrix
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Manage access levels for each role
            </Typography>
          </Box>

          {/* Column headers */}
          <Box
            display="flex"
            alignItems="center"
            height={48}
            px={2.5}
            sx={{ bgcolor: '#1a1a24', flexShrink: 0 }}
          >
            <Box flex={1}>
              <Typography fontSize={12} fontWeight={600} color="#a1a1aa">Permission</Typography>
            </Box>
            <Box width={120} textAlign="center">
              <Typography fontSize={12} fontWeight={600} sx={{ color: '#8b5cf6' }}>Admin</Typography>
            </Box>
            <Box width={120} textAlign="center">
              <Typography fontSize={12} fontWeight={600} sx={{ color: '#22d3ee' }}>Editor</Typography>
            </Box>
            <Box width={120} textAlign="center">
              <Typography fontSize={12} fontWeight={600} sx={{ color: '#4ade80' }}>Viewer</Typography>
            </Box>
          </Box>

          {/* Rows */}
          <Box flex={1} overflow="auto">
            {pagedSections.map((section) => (
              <Box key={section.title}>
                {/* Section header */}
                <Box
                  height={40}
                  display="flex"
                  alignItems="center"
                  px={2.5}
                  sx={{ bgcolor: '#0d0d18' }}
                >
                  <Typography fontSize={12} fontWeight={600} sx={{ color: '#c4b5fd' }}>
                    {section.title}
                  </Typography>
                </Box>
                {/* Permission rows */}
                {section.rows.map((row) => {
                  const idx = rowIndex++;
                  return (
                    <Box
                      key={row.label}
                      display="flex"
                      alignItems="center"
                      height={48}
                      px={2.5}
                      sx={{
                        bgcolor: idx % 2 === 1 ? '#1a1a24' : 'transparent',
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Box flex={1}>
                        <Typography fontSize={13}>{row.label}</Typography>
                      </Box>
                      <Box width={120} display="flex" justifyContent="center">
                        <PermIcon granted={row.admin} />
                      </Box>
                      <Box width={120} display="flex" justifyContent="center">
                        <PermIcon granted={row.editor} />
                      </Box>
                      <Box width={120} display="flex" justifyContent="center">
                        <PermIcon granted={row.viewer} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Pagination */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontSize={13} color="text.secondary">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, dataRows.length)}-{Math.min(page * PAGE_SIZE, dataRows.length)} of {dataRows.length} permissions
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} color="#a1a1aa" />
            </PaginationBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <PaginationBtn key={p} active={active} onClick={() => setPage(p)}>
                  <Typography fontSize={14} fontWeight={500} color={active ? '#fff' : 'text.secondary'}>
                    {p}
                  </Typography>
                </PaginationBtn>
              );
            })}
            <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight size={16} color="#a1a1aa" />
            </PaginationBtn>
          </Box>
        </Box>
      </Box>
    </>
  );
}

/* ── Pagination button ── */
function PaginationBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        cursor: 'pointer',
        ...(active
          ? { bgcolor: 'primary.main' }
          : { bgcolor: '#1a1a24', border: 1, borderColor: 'divider', '&:hover': { borderColor: 'text.secondary' } }),
      }}
    >
      {children}
    </Box>
  );
}
