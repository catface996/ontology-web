import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Table, Checkbox, Tag, Card, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowRight, Type, MapPin, Users, Briefcase, CalendarCheck, PenTool,
  Search, Plus, Boxes, List, Ellipsis, Pencil, Brain,
  ArrowLeftRight, ChevronDown,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useHeader } from '../contexts/HeaderContext';

interface RelationData {
  id: string;
  name: string;
  description: string;
  domain: string;
  domainIcon?: React.ComponentType<{ size?: number; color?: string }>;
  range: string;
  usage: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const relationsData: RelationData[] = [
  { id: '1', name: 'worksFor', description: 'Indicates employment relationship between person and organization', domain: 'Person', range: 'Organization', usage: 1248, icon: ArrowRight, color: 'var(--primary-color)' },
  { id: '2', name: 'locatedIn', description: 'Specifies the physical location of an entity or place', domain: 'Entity', range: 'Location', usage: 856, icon: MapPin, color: '#22D3EE' },
  { id: '3', name: 'parentOf', description: 'Hierarchical relationship between parent and child person', domain: 'Person', range: 'Person', usage: 423, icon: Users, color: '#F472B6' },
  { id: '4', name: 'belongsTo', description: 'Indicates membership or ownership relationship', domain: 'Entity', range: 'Organization', usage: 267, icon: Briefcase, color: '#4ADE80' },
  { id: '5', name: 'occurredAt', description: 'Links an event to its time and date of occurrence', domain: 'Event', range: 'DateTime', usage: 156, icon: CalendarCheck, color: '#FBBF24' },
  { id: '6', name: 'createdBy', description: 'Identifies the author or creator of a document or entity', domain: 'Document', range: 'Person', usage: 89, icon: PenTool, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Relations', count: 32, Icon: ArrowLeftRight },
  { key: 'object', label: 'Object Relations', count: 18, Icon: ArrowRight },
  { key: 'data', label: 'Data Relations', count: 14, Icon: Type },
];

export default function RelationsPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Ontologies</a> },
          { title: <Typography.Text strong>Relations</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8}>
        <Input
          placeholder="Search relations..."
          prefix={<Search size={16} />}
          style={{ width: 240 }}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/relations/new/edit')}
        >
          New Relation
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? relationsData.map((r) => r.id) : []);
  };

  const getUsageColor = (usage: number): string => {
    if (usage > 500) return 'green';
    if (usage > 100) return 'blue';
    return 'orange';
  };

  const columns: ColumnsType<RelationData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < relationsData.length}
          checked={selected.length === relationsData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: RelationData) => (
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
        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
          Relation
        </Typography.Text>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, record: RelationData) => (
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
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Domain</Typography.Text>,
      dataIndex: 'domain',
      key: 'domain',
      width: 140,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Range</Typography.Text>,
      dataIndex: 'range',
      key: 'range',
      width: 100,
      align: 'center',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Usage</Typography.Text>,
      dataIndex: 'usage',
      key: 'usage',
      width: 100,
      align: 'center',
      render: (val: number) => (
        <Tag color={getUsageColor(val)}>{val.toLocaleString()}</Tag>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: unknown, record: RelationData) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Brain size={16} />}
            onClick={() => navigate(`/relations/${record.id}/logic`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/relations/${record.id}/edit`)}
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
                <f.Icon size={16} />
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
          <Table<RelationData>
            columns={columns}
            dataSource={relationsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ flex: 1 }}
            rowClassName={(record) =>
              selected.includes(record.id) ? 'ant-table-row-selected' : ''
            }
          />
          <Pagination
            count={32}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="relations"
          />
        </Card>
      </div>
    </>
  );
}
