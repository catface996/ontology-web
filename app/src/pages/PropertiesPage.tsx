import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Table, Checkbox, Tag, Card, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Type, Hash, Mail, MapPin, Calendar, AlignLeft, List,
  Search, Plus, Boxes, Ellipsis, Pencil, ChevronDown, ArrowLeftRight,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useHeader } from '../contexts/HeaderContext';

interface PropertyData {
  id: string;
  name: string;
  description: string;
  dataType: string;
  definedOn: string;
  required: boolean;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const propertiesData: PropertyData[] = [
  { id: '1', name: 'name', description: 'The display name or title of an entity', dataType: 'String', definedOn: 'Entity', required: true, icon: Type, color: 'var(--primary-color)' },
  { id: '2', name: 'email', description: 'Contact email address for persons and organizations', dataType: 'String', definedOn: 'Person', required: true, icon: Mail, color: '#22D3EE' },
  { id: '3', name: 'age', description: 'The age of a person in years', dataType: 'Integer', definedOn: 'Person', required: false, icon: Hash, color: '#F472B6' },
  { id: '4', name: 'address', description: 'Physical street address or location description', dataType: 'String', definedOn: 'Location', required: false, icon: MapPin, color: '#4ADE80' },
  { id: '5', name: 'foundedDate', description: 'The date when an organization was established', dataType: 'Date', definedOn: 'Organization', required: false, icon: Calendar, color: '#FBBF24' },
  { id: '6', name: 'description', description: 'A detailed text description of an entity', dataType: 'Text', definedOn: 'Entity', required: false, icon: AlignLeft, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Properties', count: 64, Icon: List },
  { key: 'string', label: 'String Props', count: 28, Icon: Type },
  { key: 'number', label: 'Number Props', count: 18, Icon: Hash },
];

const dataTypeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  String: Type,
  Integer: Hash,
  Date: Calendar,
  Text: Type,
};

export default function PropertiesPage() {
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
          { title: <Typography.Text strong>Properties</Typography.Text> },
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
          onClick={() => navigate('/properties/new/edit')}
        >
          New Property
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? propertiesData.map((p) => p.id) : []);
  };

  const columns: ColumnsType<PropertyData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < propertiesData.length}
          checked={selected.length === propertiesData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: PropertyData) => (
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
            Property
          </Typography.Text>
          <ArrowLeftRight size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, record: PropertyData) => (
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
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Data Type</Typography.Text>,
      dataIndex: 'dataType',
      key: 'dataType',
      width: 140,
      render: (dataType: string) => {
        const DataTypeIcon = dataTypeIcons[dataType] || Type;
        return (
          <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
            <DataTypeIcon size={12} />
            <Typography.Text strong style={{ fontSize: 14, color: 'var(--primary-color)' }}>
              {dataType}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Defined On</Typography.Text>,
      dataIndex: 'definedOn',
      key: 'definedOn',
      width: 100,
      align: 'center',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Required</Typography.Text>,
      dataIndex: 'required',
      key: 'required',
      width: 100,
      align: 'center',
      render: (required: boolean) => (
        <Tag color={required ? 'green' : 'default'}>{required ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: unknown, record: PropertyData) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/properties/${record.id}/edit`)}
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
                  background: filter === f.key ? 'var(--primary-color)' : f.key === 'string' ? 'rgba(255,255,255,0.06)' : 'transparent',
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
          <Table<PropertyData>
            columns={columns}
            dataSource={propertiesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            rowKey="id"
            pagination={false}
            size="middle"
            style={{ flex: 1 }}
            rowClassName={(record, index) =>
              selected.includes(record.id) ? 'ant-table-row-selected' : index % 2 === 1 ? 'ant-table-row-striped' : ''
            }
          />
          <Pagination
            count={64}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="properties"
          />
        </Card>
      </div>
    </>
  );
}
