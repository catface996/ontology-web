import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Table, Checkbox, Tag, Card, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Box as BoxIcon, User, Building2, MapPin, Calendar, FileText, CornerDownRight,
  Search, Plus, Boxes, List, Ellipsis, Pencil, Brain,
  Ban, GitFork, File, ChevronDown, ArrowLeftRight,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useHeader } from '../contexts/HeaderContext';

interface ClassData {
  id: string;
  name: string;
  description: string;
  parent: string | null;
  properties: number;
  instances: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const classesData: ClassData[] = [
  { id: '1', name: 'Entity', description: 'Base class for all entities in the knowledge graph', parent: null, properties: 8, instances: 1248, icon: BoxIcon, color: 'var(--primary-color)' },
  { id: '2', name: 'Person', description: 'Represents a human individual with personal attributes', parent: 'Entity', properties: 12, instances: 524, icon: User, color: '#22D3EE' },
  { id: '3', name: 'Organization', description: 'A company, institution, or group with a formal structure', parent: 'Entity', properties: 15, instances: 312, icon: Building2, color: '#F472B6' },
  { id: '4', name: 'Location', description: 'Geographic place or address with coordinates', parent: 'Entity', properties: 9, instances: 412, icon: MapPin, color: '#4ADE80' },
  { id: '5', name: 'Event', description: 'An occurrence that happens at a specific time and place', parent: 'Entity', properties: 7, instances: 89, icon: Calendar, color: '#FBBF24' },
  { id: '6', name: 'Document', description: 'A written or digital file containing structured information', parent: 'Entity', properties: 11, instances: 0, icon: FileText, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Classes', count: 48, icon: Ban },
  { key: 'root', label: 'Root Classes', count: 12, icon: GitFork },
  { key: 'leaf', label: 'Leaf Classes', count: 28, icon: File },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>(['2']);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Ontologies</a> },
          { title: <Typography.Text strong>Classes</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8}>
        <Input
          placeholder="Search classes..."
          prefix={<Search size={16} />}
          style={{ width: 240 }}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/classes/new/edit')}
        >
          New Class
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? classesData.map((c) => c.id) : []);
  };

  const getInstancesColor = (instances: number): string => {
    if (instances === 0) return 'blue';
    if (instances < 100) return 'orange';
    return 'green';
  };

  const columns: ColumnsType<ClassData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < classesData.length}
          checked={selected.length === classesData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: ClassData) => (
        <Checkbox
          checked={selected.includes(record.id)}
          onChange={() =>
            setSelected((p) =>
              p.includes(record.id) ? p.filter((i) => i !== record.id) : [...p, record.id]
            )
          }
        />
      ),
    },
    {
      title: (
        <Flex align="center" gap={6}>
          <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
            Name
          </Typography.Text>
          <ArrowLeftRight size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, record: ClassData) => (
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${record.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <record.icon size={16} color={record.color} />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {record.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Parent Class</Typography.Text>,
      dataIndex: 'parent',
      key: 'parent',
      width: 140,
      render: (parent: string | null) =>
        parent ? (
          <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
            <CornerDownRight size={12} />
            <Typography.Text strong style={{ fontSize: 14, color: 'var(--primary-color)' }}>
              {parent}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text style={{ fontSize: 14, color: '#71717a' }}>—</Typography.Text>
        ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Properties</Typography.Text>,
      dataIndex: 'properties',
      key: 'properties',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Instances</Typography.Text>,
      dataIndex: 'instances',
      key: 'instances',
      width: 100,
      align: 'center',
      render: (val: number, record: ClassData) => (
        <Tag color={getInstancesColor(record.instances)}>{val.toLocaleString()}</Tag>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: unknown, record: ClassData) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Brain size={16} />}
            onClick={() => navigate(`/classes/${record.id}/logic`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/classes/${record.id}/edit`)}
          />
          <Button type="text" size="small" icon={<Ellipsis size={16} />} />
        </Flex>
      ),
    },
  ];

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Toolbar */}
        <Flex justify="space-between" align="center">
          <Flex gap={12}>
            {filters.map((f) => (
              <div
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: filter === f.key ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)',
                  color: filter === f.key ? '#fff' : '#a1a1aa',
                }}
              >
                <f.icon size={16} />
                <Typography.Text style={{ fontSize: 14, fontWeight: filter === f.key ? 500 : 400, color: 'inherit' }}>
                  {f.label}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: 'inherit', opacity: filter === f.key ? 0.7 : 1 }}>
                  {f.count}
                </Typography.Text>
              </div>
            ))}
          </Flex>

          <Flex gap={12} align="stretch">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                border: '1px solid #27273a',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#A855F7' }} />
              <Typography.Text style={{ fontSize: 14 }}>Enterprise</Typography.Text>
              <ChevronDown size={12} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #27273a', borderRadius: 8 }}>
              {[
                { key: 'list', Icon: List },
                { key: 'grid', Icon: Boxes },
              ].map(({ key, Icon }) => (
                <div
                  key={key}
                  onClick={() => setView(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 8,
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: view === key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <Icon size={18} color={view === key ? undefined : 'gray'} />
                </div>
              ))}
            </div>
          </Flex>
        </Flex>

        {/* Table */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }} styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}>
          <Table<ClassData>
            columns={columns}
            dataSource={classesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ flex: 1 }}
            rowClassName={(record, index) =>
              selected.includes(record.id) ? 'ant-table-row-selected' : index % 2 === 1 ? 'ant-table-row-striped' : ''
            }
          />
          <Pagination
            count={48}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="classes"
          />
        </Card>
      </div>
    </>
  );
}
