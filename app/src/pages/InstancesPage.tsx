import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Table, Checkbox, Tag, Card, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  User, Building2, MapPin, Calendar,
  Search, Plus, LayoutGrid, List,
  Ellipsis, Pencil, Share2,
  Database, UserIcon, Landmark,
  ChevronDown, ArrowUpDown,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useHeader } from '../contexts/HeaderContext';

interface InstanceData {
  id: string;
  name: string;
  description: string;
  className: string;
  classIcon: React.ComponentType<{ size?: number; color?: string }>;
  relations: number;
  created: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const instancesData: InstanceData[] = [
  { id: '1', name: 'John Smith', description: 'Senior Software Engineer at Acme Corp', className: 'Person', classIcon: User, relations: 5, created: 'Jan 15, 2024', icon: User, color: 'var(--primary-color)' },
  { id: '2', name: 'Acme Corp', description: 'Global technology and innovation company', className: 'Organization', classIcon: Building2, relations: 12, created: 'Aug 20, 2023', icon: Building2, color: '#22D3EE' },
  { id: '3', name: 'New York', description: 'Major metropolitan city in the United States', className: 'Location', classIcon: MapPin, relations: 8, created: 'Jun 10, 2023', icon: MapPin, color: '#F472B6' },
  { id: '4', name: 'Jane Doe', description: 'Product Manager with 8 years experience', className: 'Person', classIcon: User, relations: 3, created: 'Feb 1, 2024', icon: User, color: '#4ADE80' },
  { id: '5', name: 'TechStart Inc', description: 'Innovative startup in AI and machine learning', className: 'Organization', classIcon: Building2, relations: 6, created: 'Jan 5, 2024', icon: Building2, color: '#FBBF24' },
  { id: '6', name: 'Annual Meeting', description: 'Yearly company-wide strategic planning event', className: 'Event', classIcon: Calendar, relations: 4, created: 'Jan 20, 2024', icon: Calendar, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Instances', count: 2585, icon: Database },
  { key: 'person', label: 'Person', count: 524, icon: UserIcon },
  { key: 'organization', label: 'Organization', count: 312, icon: Landmark },
];

export default function InstancesPage() {
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
          { title: <Typography.Text strong>Instances</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8}>
        <Input
          placeholder="Search instances..."
          prefix={<Search size={16} />}
          style={{ width: 240 }}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/instances/new/edit')}
        >
          New Instance
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? instancesData.map((c) => c.id) : []);
  };

  const columns: ColumnsType<InstanceData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < instancesData.length}
          checked={selected.length === instancesData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: InstanceData) => (
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
            Instance
          </Typography.Text>
          <ArrowUpDown size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (_: string, record: InstanceData) => (
        <Flex align="center" gap={10} style={{ whiteSpace: 'nowrap' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${record.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <record.icon size={16} color={record.color} />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }} ellipsis>
            {record.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Class</Typography.Text>,
      dataIndex: 'className',
      key: 'className',
      width: 140,
      render: (_: string, record: InstanceData) => (
        <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
          <record.classIcon size={12} />
          <Typography.Text strong style={{ fontSize: 14, color: 'var(--primary-color)' }}>
            {record.className}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Relations</Typography.Text>,
      dataIndex: 'relations',
      key: 'relations',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Created</Typography.Text>,
      dataIndex: 'created',
      key: 'created',
      width: 100,
      align: 'center',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_: unknown, record: InstanceData) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Share2 size={16} />}
            onClick={() => navigate(`/instances/${record.id}/topology`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/instances/${record.id}/edit`)}
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
                  {f.count.toLocaleString()}
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
                { key: 'grid', Icon: LayoutGrid },
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
          <Table<InstanceData>
            columns={columns}
            dataSource={instancesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ flex: 1 }}
            rowClassName={(record) =>
              selected.includes(record.id) ? 'ant-table-row-selected' : ''
            }
          />
          <Pagination
            count={2585}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="instances"
          />
        </Card>
      </div>
    </>
  );
}
