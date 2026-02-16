import { useState, useEffect } from 'react';
import { Breadcrumb, Button, Input, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, Search } from 'lucide-react';
import TableCard from '../components/TableCard';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type FilterKey = 'all' | 'created' | 'modified' | 'deleted';

interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: 'Created' | 'Modified' | 'Deleted';
  description: string;
  entity: string;
}

/* Badge color map */
const actionStyles: Record<string, { color: string; bg: string }> = {
  Created:  { color: '#4ade80', bg: '#132B1E' },
  Modified: { color: '#fbbf24', bg: '#2E2008' },
  Deleted:  { color: '#f87171', bg: '#2E1215' },
};

const entityStyles: Record<string, { color: string; bg: string }> = {
  Class:    { color: '#fff', bg: 'var(--primary-color)' },
  Relation: { color: '#4ade80', bg: '#132B1E' },
  Property: { color: '#fbbf24', bg: '#2E2008' },
  Axiom:    { color: '#f4f4f5', bg: '#1a1a24' },
  Import:   { color: '#818cf8', bg: '#191933' },
};

/* -- Mock data -- */
const logEntries: LogEntry[] = [
  { id: 1, timestamp: '2024-01-15 14:32', user: 'admin', action: 'Created', description: 'Added new class "MedicalRecord" with 5 properties', entity: 'Class' },
  { id: 2, timestamp: '2024-01-15 13:18', user: 'data_eng', action: 'Modified', description: 'Updated domain of "hasEmployee" from Thing to Organization', entity: 'Relation' },
  { id: 3, timestamp: '2024-01-15 11:45', user: 'admin', action: 'Deleted', description: 'Removed deprecated property "legacyId" from Person class', entity: 'Property' },
  { id: 4, timestamp: '2024-01-14 16:50', user: 'ontologist', action: 'Created', description: 'Added disjointWith axiom between Person and Organization', entity: 'Axiom' },
  { id: 5, timestamp: '2024-01-14 10:22', user: 'data_eng', action: 'Modified', description: 'Changed cardinality of hasName to maxCardinality=1', entity: 'Property' },
  { id: 6, timestamp: '2024-01-13 09:05', user: 'admin', action: 'Created', description: 'Imported health: namespace with 14 classes from OWL file', entity: 'Import' },
];

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'created', label: 'Created' },
  { key: 'modified', label: 'Modified' },
  { key: 'deleted', label: 'Deleted' },
];

/* -- Page -- */
export default function ChangeLogPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Admin' },
        { title: <Typography.Text strong>Change Log</Typography.Text> },
      ]} />
    );
    setActions(
      <Flex gap={8} align="center">
        <div className="header-filter-toggle">
          {filterTabs.map((f) => (
            <div
              key={f.key}
              className={activeFilter === f.key ? 'active' : ''}
              onClick={() => { setActiveFilter(f.key); setPage(0); }}
            >
              {f.label}
            </div>
          ))}
        </div>
        <Input
          placeholder="Search logs..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          allowClear
        />
        <Button type="primary" icon={<Download size={16} />}>
          Export
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, activeFilter, search]);

  const filtered = logEntries
    .filter((e) => activeFilter === 'all' || e.action.toLowerCase() === activeFilter)
    .filter((e) =>
      !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase())
    );

  const columns: ColumnsType<LogEntry> = [
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Timestamp</Typography.Text>,
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'JetBrains Mono' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>User</Typography.Text>,
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Action</Typography.Text>,
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => {
        const style = actionStyles[action] || { color: '#f4f4f5', bg: '#1a1a24' };
        return (
          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, backgroundColor: style.bg }}>
            <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: style.color }}>{action}</Typography.Text>
          </span>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13 }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Entity</Typography.Text>,
      dataIndex: 'entity',
      key: 'entity',
      width: 100,
      align: 'center',
      render: (entity: string) => {
        const style = entityStyles[entity] || { color: '#f4f4f5', bg: '#1a1a24' };
        return (
          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, backgroundColor: style.bg }}>
            <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: style.color }}>{entity}</Typography.Text>
          </span>
        );
      },
    },
  ];

  return (
    <div className="list-page">
      <TableCard<LogEntry>
        columns={columns}
        dataSource={filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        rowKey="id"
        pagination={{
          count: filtered.length,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
          label: 'logs',
        }}
      />
    </div>
  );
}
