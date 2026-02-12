import { useState, useEffect } from 'react';
import { Breadcrumb, Typography } from 'antd';
import {
  Check, TriangleAlert, CircleCheck, Brain,
} from 'lucide-react';
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

const filters: { key: FilterKey; label: string; count?: number; countBg?: string }[] = [
  { key: 'all', label: 'All', count: 8 },
  { key: 'unread', label: 'Unread', count: 3, countBg: '#ef4444' },
  { key: 'import', label: 'Import' },
  { key: 'reasoner', label: 'Reasoner' },
  { key: 'conflicts', label: 'Conflicts' },
];

/* -- Page -- */
export default function NotificationCenterPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !!n.highlighted;
    if (activeFilter === 'import') return n.badge === 'Import';
    if (activeFilter === 'reasoner') return n.badge === 'Reasoner';
    if (activeFilter === 'conflicts') return n.badge === 'Conflict';
    return true;
  });

  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'System' },
        { title: 'Notifications' },
      ]} />
    );
    setActions(
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 16px', borderRadius: 8, backgroundColor: '#1a1a24', cursor: 'pointer',
        }}
      >
        <Check size={16} />
        <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>Mark All Read</Typography.Text>
      </div>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map((f) => {
            const isActive = f.key === activeFilter;
            return (
              <div
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                  border: isActive ? 'none' : '1px solid #303030',
                }}
              >
                <Typography.Text style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? '#fff' : undefined }}>
                  {f.label}
                </Typography.Text>
                {f.count !== undefined && (
                  <span style={{
                    padding: '1px 6px', borderRadius: 100,
                    backgroundColor: isActive ? '#fff' : (f.countBg || '#ef4444'),
                  }}>
                    <Typography.Text style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--primary-color)' : '#fff' }}>
                      {f.count}
                    </Typography.Text>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Notification list */}
        <div style={{ borderRadius: 12, border: '1px solid #303030', overflow: 'hidden' }}>
          {filtered.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 12, padding: '16px 24px',
                backgroundColor: n.highlighted ? '#1a1a24' : 'transparent',
                borderBottom: i < filtered.length - 1 ? '1px solid #303030' : 'none',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        padding: '2px 8px', borderRadius: 6,
                        backgroundColor: n.badgeBg, flexShrink: 0,
                      }}
                    >
                      <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: n.badgeColor }}>{n.badge}</Typography.Text>
                    </div>
                    <Typography.Text style={{ fontSize: 14, fontWeight: n.highlighted ? 600 : 500 }}>{n.title}</Typography.Text>
                  </div>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', flexShrink: 0 }}>{n.time}</Typography.Text>
                </div>
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', lineHeight: '1.5' }}>{n.description}</Typography.Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
