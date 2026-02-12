import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Button } from 'antd';
import { Plus, Check, Minus, ChevronLeft, ChevronRight, Shield, Pencil, Eye } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
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

/* -- Data -- */
const roles: RoleCard[] = [
  { name: 'Admin',  icon: Shield, iconColor: 'var(--primary-color)', members: 8,   description: 'Full system access with all administrative privileges including user management and configuration.' },
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

const PAGE_SIZE = 8;

/* -- Helpers -- */
function PermIcon({ granted }: { granted: boolean }) {
  return granted
    ? <Check size={18} color="#4ade80" />
    : <Minus size={18} color="#a1a1aa" />;
}

/* -- Page -- */
export default function RolesPermissionsPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [page, setPage] = useState(1);

  const dataRows = permissionSections.flatMap((s) => s.rows);
  const totalPages = Math.max(1, Math.ceil(dataRows.length / PAGE_SIZE));
  const pagedRows = dataRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pagedSections: { title: string; rows: PermissionRow[] }[] = [];
  for (const section of permissionSections) {
    const matching = section.rows.filter((r) => pagedRows.includes(r));
    if (matching.length > 0) {
      pagedSections.push({ title: section.title, rows: matching });
    }
  }

  let rowIndex = 0;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'Roles & Permissions' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<Plus size={16} />}>
        Create Role
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Role Cards */}
        <div style={{ display: 'flex', gap: 16 }}>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.name}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: '#111118',
                  border: '1px solid #303030',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: `${role.iconColor}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} color={role.iconColor} />
                    </div>
                    <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                      {role.name}
                    </Typography.Text>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: `${role.iconColor}20` }}>
                    <Typography.Text style={{ fontSize: 12, fontWeight: 500, color: role.iconColor }}>
                      {role.members} members
                    </Typography.Text>
                  </div>
                </div>
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', lineHeight: '1.5' }}>
                  {role.description}
                </Typography.Text>
              </div>
            );
          })}
        </div>

        {/* Permission Matrix Table */}
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
          {/* Table title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #303030',
            }}
          >
            <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              Permission Matrix
            </Typography.Text>
            <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
              Manage access levels for each role
            </Typography.Text>
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
            <div style={{ flex: 1 }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Permission</Typography.Text>
            </div>
            <div style={{ width: 120, textAlign: 'center' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-color)' }}>Admin</Typography.Text>
            </div>
            <div style={{ width: 120, textAlign: 'center' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee' }}>Editor</Typography.Text>
            </div>
            <div style={{ width: 120, textAlign: 'center' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>Viewer</Typography.Text>
            </div>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {pagedSections.map((section) => (
              <div key={section.title}>
                {/* Section header */}
                <div
                  style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    backgroundColor: '#0d0d18',
                  }}
                >
                  <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd' }}>
                    {section.title}
                  </Typography.Text>
                </div>
                {/* Permission rows */}
                {section.rows.map((row) => {
                  const idx = rowIndex++;
                  return (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 48,
                        padding: '0 20px',
                        backgroundColor: idx % 2 === 1 ? '#1a1a24' : 'transparent',
                        borderBottom: '1px solid #303030',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Typography.Text style={{ fontSize: 13 }}>{row.label}</Typography.Text>
                      </div>
                      <div style={{ width: 120, display: 'flex', justifyContent: 'center' }}>
                        <PermIcon granted={row.admin} />
                      </div>
                      <div style={{ width: 120, display: 'flex', justifyContent: 'center' }}>
                        <PermIcon granted={row.editor} />
                      </div>
                      <div style={{ width: 120, display: 'flex', justifyContent: 'center' }}>
                        <PermIcon granted={row.viewer} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, dataRows.length)}-{Math.min(page * PAGE_SIZE, dataRows.length)} of {dataRows.length} permissions
          </Typography.Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} color="#a1a1aa" />
            </PaginationBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <PaginationBtn key={p} active={active} onClick={() => setPage(p)}>
                  <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: active ? '#fff' : '#a1a1aa' }}>
                    {p}
                  </Typography.Text>
                </PaginationBtn>
              );
            })}
            <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight size={16} color="#a1a1aa" />
            </PaginationBtn>
          </div>
        </div>
      </div>
    </>
  );
}

/* -- Pagination button -- */
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
    <div
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        cursor: 'pointer',
        ...(active
          ? { backgroundColor: '#1677ff' }
          : { backgroundColor: '#1a1a24', border: '1px solid #303030' }),
      }}
    >
      {children}
    </div>
  );
}
