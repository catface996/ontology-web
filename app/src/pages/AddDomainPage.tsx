import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Checkbox, Input } from 'antd';
import { Plus, Search, ChevronLeft, ChevronRight, ChevronDown, ShoppingCart, Factory, Truck } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
interface Domain {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  classes: number;
  relations: number;
}

/* -- Mock data -- */
const availableDomains: Domain[] = [
  { id: 'retail', name: 'Retail', description: 'Retail and e-commerce domain ontology', icon: <ShoppingCart size={20} />, iconColor: 'var(--primary-color)', iconBg: 'var(--primary-color)', classes: 45, relations: 89 },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Industrial manufacturing processes ontology', icon: <Factory size={20} />, iconColor: '#22D3EE', iconBg: '#22D3EE20', classes: 67, relations: 134 },
  { id: 'logistics', name: 'Logistics', description: 'Supply chain and logistics domain ontology', icon: <Truck size={20} />, iconColor: '#4ADE80', iconBg: '#4ADE8020', classes: 38, relations: 72 },
];

/* -- Page -- */
export default function AddDomainPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set(['retail']));
  const [roles, setRoles] = useState<Record<string, string>>({ retail: 'Editor' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const userName = 'John Doe';

  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'User Management' },
        { title: userName },
        { title: 'Add Domain' },
      ]} />
    );
    setActions(
      <>
        <Button
          onClick={() => navigate(`/user-management/${userId}`)}
        >
          Cancel
        </Button>
        <Button type="primary" icon={<Plus size={16} />} disabled={selected.size === 0}>
          Add Selected
        </Button>
      </>
    );
  }, [setBreadcrumbs, setActions, userName, navigate, userId, selected.size]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setRoles((r) => { const n = { ...r }; delete n[id]; return n; });
      } else {
        next.add(id);
        setRoles((r) => ({ ...r, [id]: 'Editor' }));
      }
      return next;
    });
  };

  const filtered = availableDomains.filter(
    (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 24, padding: 32 }}>
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Add Domain to User</Typography.Title>
          <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>
            Select domains to assign to {userName} and set the appropriate role for each.
          </Typography.Text>
        </div>

        {/* Search */}
        <Input
          placeholder="Search domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<Search size={16} color="#a1a1aa" />}
          style={{ width: 400 }}
        />

        {/* Domain List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((d) => {
            const isSelected = selected.has(d.id);
            return (
              <div
                key={d.id}
                onClick={() => toggleSelection(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: '#1a1a24',
                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid #303030',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: d.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: d.id === 'retail' ? '#fff' : d.iconColor,
                    }}
                  >
                    {d.icon}
                  </div>

                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelection(d.id)}
                  />

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</Typography.Text>
                    <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{d.description}</Typography.Text>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, paddingLeft: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography.Text style={{ fontSize: 14, fontWeight: 600 }}>{d.classes}</Typography.Text>
                      <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>Classes</Typography.Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography.Text style={{ fontSize: 14, fontWeight: 600 }}>{d.relations}</Typography.Text>
                      <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>Relations</Typography.Text>
                    </div>
                  </div>
                </div>

                {/* Role Dropdown (only when selected) */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: '#0a0a0f',
                      border: '1px solid #303030',
                      cursor: 'pointer',
                    }}
                  >
                    <Typography.Text style={{ fontSize: 13 }}>{roles[d.id] || 'Editor'}</Typography.Text>
                    <ChevronDown size={16} color="#a1a1aa" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderTop: '1px solid #303030',
        }}
      >
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>
          Showing 1-3 of 12 domains
        </Typography.Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            style={{
              width: 36, height: 36, borderRadius: 8, backgroundColor: '#1a1a24',
              border: '1px solid #303030', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} color="#a1a1aa" />
          </div>
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backgroundColor: currentPage === p ? 'var(--primary-color)' : '#1a1a24',
                border: currentPage === p ? 'none' : '1px solid #303030',
              }}
            >
              <Typography.Text style={{ fontSize: 14, fontWeight: currentPage === p ? 500 : 400 }}>{p}</Typography.Text>
            </div>
          ))}
          <Typography.Text style={{ fontSize: 14, color: '#a1a1aa', display: 'flex', alignItems: 'center', padding: '0 4px' }}>...</Typography.Text>
          <div
            onClick={() => setCurrentPage(4)}
            style={{
              width: 36, height: 36, borderRadius: 8, backgroundColor: '#1a1a24',
              border: '1px solid #303030', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Typography.Text style={{ fontSize: 14 }}>4</Typography.Text>
          </div>
          <div
            onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
            style={{
              width: 36, height: 36, borderRadius: 8, backgroundColor: '#1a1a24',
              border: '1px solid #303030', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </>
  );
}
