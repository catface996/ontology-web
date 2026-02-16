import { useState, useEffect } from 'react';
import { Breadcrumb, Button, Card, Input, Typography, Flex } from 'antd';
import {
  Check, Search, TriangleAlert, CircleCheck, Brain,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type FilterKey = 'all' | 'unread' | 'import' | 'reasoner' | 'conflicts';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  highlighted?: boolean;
}

/* -- Mock data -- */
const notifications: Notification[] = [
  {
    id: 'n1', title: 'Consistency Check Failed', time: '2 min ago',
    description: 'Reasoner detected an inconsistency: Person and Organization share instance "AcmeCorp" violating disjointWith axiom.',
    icon: <TriangleAlert size={18} />, iconColor: '#f87171', iconBg: '#2E1215',
    badge: 'Conflict', badgeColor: '#f87171', badgeBg: '#2E1215', highlighted: true,
  },
  {
    id: 'n2', title: 'Import Completed Successfully', time: '15 min ago',
    description: 'Successfully imported health: namespace from OWL file. 14 classes, 23 properties, and 8 relations added.',
    icon: <CircleCheck size={18} />, iconColor: '#4ade80', iconBg: '#132B1E',
    badge: 'Import', badgeColor: '#4ade80', badgeBg: '#132B1E', highlighted: true,
  },
  {
    id: 'n3', title: 'Reasoning Complete', time: '1 hour ago',
    description: 'HermiT reasoner completed inference on v2.4.0. 12 new inferred triples generated. No inconsistencies found.',
    icon: <Brain size={18} />, iconColor: '#818cf8', iconBg: '#191933',
    badge: 'Reasoner', badgeColor: '#818cf8', badgeBg: '#191933', highlighted: true,
  },
  {
    id: 'n4', title: 'Validation Warning', time: '3 hours ago',
    description: 'Property "hasAge" on class Person is missing range restriction. Consider adding xsd:integer range.',
    icon: <TriangleAlert size={18} />, iconColor: '#fbbf24', iconBg: '#2E2008',
    badge: 'Conflict', badgeColor: '#fbbf24', badgeBg: '#2E2008',
  },
  {
    id: 'n5', title: 'Export Completed', time: 'Yesterday',
    description: 'Ontology v2.3.0 exported as OWL/XML format. File size: 2.4 MB, 156 classes, 89 relations.',
    icon: <CircleCheck size={18} />, iconColor: '#4ade80', iconBg: '#132B1E',
    badge: 'Import', badgeColor: '#818cf8', badgeBg: '#191933',
  },
];

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'import', label: 'Import' },
  { key: 'reasoner', label: 'Reasoner' },
  { key: 'conflicts', label: 'Conflicts' },
];

/* -- Page -- */
export default function NotificationCenterPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'System' },
        { title: <Typography.Text strong>Notifications</Typography.Text> },
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
          placeholder="Search notifications..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          allowClear
        />
        <Button icon={<Check size={16} />}>
          Mark All Read
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, activeFilter, search]);

  const filtered = notifications
    .filter((n) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'unread') return !!n.highlighted;
      if (activeFilter === 'import') return n.badge === 'Import';
      if (activeFilter === 'reasoner') return n.badge === 'Reasoner';
      if (activeFilter === 'conflicts') return n.badge === 'Conflict';
      return true;
    })
    .filter((n) =>
      !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase())
    );

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="list-page">
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
      >
        <div style={{ flex: 1, overflow: 'auto' }}>
          {paged.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 12, padding: '16px 24px',
                backgroundColor: n.highlighted ? 'rgba(255,255,255,0.03)' : 'transparent',
                borderBottom: i < paged.length - 1 ? '1px solid var(--border-color, #27273a)' : 'none',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: n.iconBg, color: n.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {n.icon}
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Flex align="center" gap={8}>
                    <span
                      style={{
                        padding: '2px 8px', borderRadius: 6,
                        backgroundColor: n.badgeBg, flexShrink: 0,
                      }}
                    >
                      <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: n.badgeColor }}>{n.badge}</Typography.Text>
                    </span>
                    <Typography.Text style={{ fontSize: 14, fontWeight: n.highlighted ? 600 : 500 }}>{n.title}</Typography.Text>
                  </Flex>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', flexShrink: 0 }}>{n.time}</Typography.Text>
                </div>
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', lineHeight: '1.5' }}>{n.description}</Typography.Text>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          label="notifications"
        />
      </Card>
    </div>
  );
}
