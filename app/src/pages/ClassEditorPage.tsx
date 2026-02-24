import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Checkbox, Tag, Spin, App, ColorPicker, Popover } from 'antd';
import {
  ChevronRight, Save, Info, List, Plus, Trash2, Eye,
  Boxes, Brain, ArrowLeftRight,
  // Building / Facility
  Factory, Building2, Warehouse, Home, Store, Hospital, School, Church, Landmark,
  // People / Org
  User, Users, UserCheck, UserPlus, Contact, PersonStanding, Briefcase, BadgeCheck,
  // Transport / Logistics
  Truck, Car, Plane, Ship, Train, Package, Box, Container, ShoppingCart,
  // Food / Dining
  Utensils, ChefHat, Apple, Beef, Egg, Milk, Wheat, Cookie, Cake, Coffee, Wine, Pizza,
  // Industry / Production
  Wrench, Settings, Cog, Hammer, HardHat, Zap, Gauge, Thermometer, FlaskConical, Atom,
  // Document / Data
  File, FileText, Folder, Database, Server, Cloud, Clipboard, BookOpen, Notebook,
  // Time / Schedule
  Calendar, Clock, Timer, AlarmClock, Hourglass,
  // Status / Mark
  CheckCircle, AlertTriangle, CircleAlert, Star, Heart, Flag, Tag as TagIcon, Bookmark,
  // Communication
  Mail, Phone, MessageCircle, Bell, Megaphone,
  // Nature / Location
  MapPin, Globe, Mountain, TreePine, Sun, Moon, Droplet,
  // Tech
  Cpu, Monitor, Smartphone, Wifi, Bluetooth, Code, Terminal,
  // Other
  Link, Share2, GitBranch, Layers, Grid3x3, ListIcon, Shield, Lock, Key, EyeIcon,
  Network,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';

/* ── Icon options for class nodes — grouped by category ── */
type IconOption = { name: string; label: string; Icon: React.FC<{ size?: number; color?: string }> };
interface IconCategory { category: string; icons: IconOption[] }

const ICON_CATEGORIES: IconCategory[] = [
  {
    category: 'Building / Facility',
    icons: [
      { name: 'factory', label: 'Factory', Icon: Factory },
      { name: 'building-2', label: 'Building', Icon: Building2 },
      { name: 'warehouse', label: 'Warehouse', Icon: Warehouse },
      { name: 'home', label: 'Home', Icon: Home },
      { name: 'store', label: 'Store', Icon: Store },
      { name: 'hospital', label: 'Hospital', Icon: Hospital },
      { name: 'school', label: 'School', Icon: School },
      { name: 'church', label: 'Church', Icon: Church },
      { name: 'landmark', label: 'Landmark', Icon: Landmark },
    ],
  },
  {
    category: 'People / Org',
    icons: [
      { name: 'user', label: 'User', Icon: User },
      { name: 'users', label: 'Users', Icon: Users },
      { name: 'user-check', label: 'User Check', Icon: UserCheck },
      { name: 'user-plus', label: 'User Plus', Icon: UserPlus },
      { name: 'contact', label: 'Contact', Icon: Contact },
      { name: 'person-standing', label: 'Person', Icon: PersonStanding },
      { name: 'briefcase', label: 'Briefcase', Icon: Briefcase },
      { name: 'badge-check', label: 'Badge', Icon: BadgeCheck },
    ],
  },
  {
    category: 'Transport / Logistics',
    icons: [
      { name: 'truck', label: 'Truck', Icon: Truck },
      { name: 'car', label: 'Car', Icon: Car },
      { name: 'plane', label: 'Plane', Icon: Plane },
      { name: 'ship', label: 'Ship', Icon: Ship },
      { name: 'train', label: 'Train', Icon: Train },
      { name: 'package', label: 'Package', Icon: Package },
      { name: 'box', label: 'Box', Icon: Box },
      { name: 'container', label: 'Container', Icon: Container },
      { name: 'shopping-cart', label: 'Cart', Icon: ShoppingCart },
    ],
  },
  {
    category: 'Food / Dining',
    icons: [
      { name: 'utensils', label: 'Utensils', Icon: Utensils },
      { name: 'chef-hat', label: 'Chef Hat', Icon: ChefHat },
      { name: 'apple', label: 'Apple', Icon: Apple },
      { name: 'beef', label: 'Beef', Icon: Beef },
      { name: 'egg', label: 'Egg', Icon: Egg },
      { name: 'milk', label: 'Milk', Icon: Milk },
      { name: 'wheat', label: 'Wheat', Icon: Wheat },
      { name: 'cookie', label: 'Cookie', Icon: Cookie },
      { name: 'cake', label: 'Cake', Icon: Cake },
      { name: 'coffee', label: 'Coffee', Icon: Coffee },
      { name: 'wine', label: 'Wine', Icon: Wine },
      { name: 'pizza', label: 'Pizza', Icon: Pizza },
    ],
  },
  {
    category: 'Industry / Production',
    icons: [
      { name: 'wrench', label: 'Wrench', Icon: Wrench },
      { name: 'settings', label: 'Settings', Icon: Settings },
      { name: 'cog', label: 'Cog', Icon: Cog },
      { name: 'hammer', label: 'Hammer', Icon: Hammer },
      { name: 'hard-hat', label: 'Hard Hat', Icon: HardHat },
      { name: 'zap', label: 'Zap', Icon: Zap },
      { name: 'gauge', label: 'Gauge', Icon: Gauge },
      { name: 'thermometer', label: 'Thermo', Icon: Thermometer },
      { name: 'flask-conical', label: 'Flask', Icon: FlaskConical },
      { name: 'atom', label: 'Atom', Icon: Atom },
    ],
  },
  {
    category: 'Document / Data',
    icons: [
      { name: 'file', label: 'File', Icon: File },
      { name: 'file-text', label: 'File Text', Icon: FileText },
      { name: 'folder', label: 'Folder', Icon: Folder },
      { name: 'database', label: 'Database', Icon: Database },
      { name: 'server', label: 'Server', Icon: Server },
      { name: 'cloud', label: 'Cloud', Icon: Cloud },
      { name: 'clipboard', label: 'Clipboard', Icon: Clipboard },
      { name: 'book-open', label: 'Book', Icon: BookOpen },
      { name: 'notebook', label: 'Notebook', Icon: Notebook },
    ],
  },
  {
    category: 'Time / Schedule',
    icons: [
      { name: 'calendar', label: 'Calendar', Icon: Calendar },
      { name: 'clock', label: 'Clock', Icon: Clock },
      { name: 'timer', label: 'Timer', Icon: Timer },
      { name: 'alarm-clock', label: 'Alarm', Icon: AlarmClock },
      { name: 'hourglass', label: 'Hourglass', Icon: Hourglass },
    ],
  },
  {
    category: 'Status / Mark',
    icons: [
      { name: 'check-circle', label: 'Check', Icon: CheckCircle },
      { name: 'alert-triangle', label: 'Warning', Icon: AlertTriangle },
      { name: 'circle-alert', label: 'Info', Icon: CircleAlert },
      { name: 'star', label: 'Star', Icon: Star },
      { name: 'heart', label: 'Heart', Icon: Heart },
      { name: 'flag', label: 'Flag', Icon: Flag },
      { name: 'tag', label: 'Tag', Icon: TagIcon },
      { name: 'bookmark', label: 'Bookmark', Icon: Bookmark },
    ],
  },
  {
    category: 'Communication',
    icons: [
      { name: 'mail', label: 'Mail', Icon: Mail },
      { name: 'phone', label: 'Phone', Icon: Phone },
      { name: 'message-circle', label: 'Message', Icon: MessageCircle },
      { name: 'bell', label: 'Bell', Icon: Bell },
      { name: 'megaphone', label: 'Megaphone', Icon: Megaphone },
    ],
  },
  {
    category: 'Nature / Location',
    icons: [
      { name: 'map-pin', label: 'Map Pin', Icon: MapPin },
      { name: 'globe', label: 'Globe', Icon: Globe },
      { name: 'mountain', label: 'Mountain', Icon: Mountain },
      { name: 'tree-pine', label: 'Tree', Icon: TreePine },
      { name: 'sun', label: 'Sun', Icon: Sun },
      { name: 'moon', label: 'Moon', Icon: Moon },
      { name: 'droplet', label: 'Droplet', Icon: Droplet },
    ],
  },
  {
    category: 'Tech',
    icons: [
      { name: 'cpu', label: 'CPU', Icon: Cpu },
      { name: 'monitor', label: 'Monitor', Icon: Monitor },
      { name: 'smartphone', label: 'Phone', Icon: Smartphone },
      { name: 'wifi', label: 'WiFi', Icon: Wifi },
      { name: 'bluetooth', label: 'Bluetooth', Icon: Bluetooth },
      { name: 'code', label: 'Code', Icon: Code },
      { name: 'terminal', label: 'Terminal', Icon: Terminal },
    ],
  },
  {
    category: 'Other',
    icons: [
      { name: 'boxes', label: 'Boxes', Icon: Boxes },
      { name: 'link', label: 'Link', Icon: Link },
      { name: 'share-2', label: 'Share', Icon: Share2 },
      { name: 'git-branch', label: 'Branch', Icon: GitBranch },
      { name: 'layers', label: 'Layers', Icon: Layers },
      { name: 'grid-3x3', label: 'Grid', Icon: Grid3x3 },
      { name: 'list', label: 'List', Icon: ListIcon },
      { name: 'shield', label: 'Shield', Icon: Shield },
      { name: 'lock', label: 'Lock', Icon: Lock },
      { name: 'key', label: 'Key', Icon: Key },
      { name: 'eye', label: 'Eye', Icon: EyeIcon },
      { name: 'network', label: 'Network', Icon: Network },
    ],
  },
];

/** Flat list for quick lookup */
const ALL_ICONS: IconOption[] = ICON_CATEGORIES.flatMap((c) => c.icons);
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getClass, createClass, updateClass,
  listProperties, listRelations,
  listClassProperties, bindClassProperties, unbindClassProperty,
  type ClassDTO, type PropertyDTO, type RelationDTO,
  type ClassPropertyDTO,
} from '../services/coreService';

export default function ClassEditorPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentOntologyId } = useCurrentOntology();
  const { setBreadcrumbs, setActions } = useHeader();
  const isEditing = classId !== undefined && classId !== 'new';
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [apiClass, setApiClass] = useState<ClassDTO | null>(null);
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>('#8B5CF6');
  const [icon, setIcon] = useState<string>('boxes');
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Property bind/unbind state
  const [boundProperties, setBoundProperties] = useState<ClassPropertyDTO[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyDTO[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);
  const [bindIsRequired, setBindIsRequired] = useState(false);
  const [bindIsUnique, setBindIsUnique] = useState(false);
  const [bindDefaultValue, setBindDefaultValue] = useState('');

  // Relations (read-only, filtered from all ontology relations)
  const [allRelations, setAllRelations] = useState<RelationDTO[]>([]);

  // Load class detail when editing
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getClass(Number(classId));
        if (!cancelled && res.data) {
          setApiClass(res.data);
          setName(res.data.name);
          setUri(res.data.uri ?? '');
          setDescription(res.data.description ?? '');
          if (res.data.color) setColor(res.data.color);
          if (res.data.icon) setIcon(res.data.icon);
        }
      } catch {
        // fields stay empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [classId, isEditing]);

  // Load available properties + relations for the ontology
  useEffect(() => {
    const ontologyId = apiClass?.ontologyId ?? currentOntologyId;
    if (!ontologyId) return;
    (async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          listProperties({ ontologyId }),
          listRelations({ ontologyId }),
        ]);
        setAllProperties(pRes.data ?? []);
        setAllRelations(rRes.data ?? []);
      } catch { /* ignore */ }
    })();
  }, [apiClass?.ontologyId, currentOntologyId]);

  // Load bound properties when editing
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const cpRes = await listClassProperties(Number(classId));
        setBoundProperties(cpRes.data ?? []);
      } catch { /* ignore */ }
    })();
  }, [classId, isEditing]);

  const handleBindProperty = async () => {
    if (!selectedPropertyId || !isEditing) return;
    try {
      await bindClassProperties(Number(classId), [{ propertyId: selectedPropertyId, isRequired: bindIsRequired, isUnique: bindIsUnique, defaultValue: bindDefaultValue || undefined }]);
      message.success('Property bound');
      setSelectedPropertyId(undefined);
      setBindIsRequired(false);
      setBindIsUnique(false);
      setBindDefaultValue('');
      const res = await listClassProperties(Number(classId));
      setBoundProperties(res.data ?? []);
    } catch {
      message.error('Failed to bind property');
    }
  };

  const handleUnbindProperty = async (propertyId: number) => {
    if (!isEditing) return;
    try {
      await unbindClassProperty(Number(classId), propertyId);
      setBoundProperties(prev => prev.filter(p => p.propertyId !== propertyId));
    } catch {
      message.error('Failed to unbind property');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { message.error('Class name is required'); return; }
    if (!uri.trim()) { message.error('URI is required'); return; }
    const ontologyId = apiClass?.ontologyId ?? currentOntologyId;
    if (!ontologyId) { message.error('No ontology selected'); return; }
    setSaving(true);
    try {
      if (isEditing && apiClass) {
        await updateClass({ id: apiClass.id, name, uri, description, color, icon });
      } else {
        await createClass({ ontologyId, name, uri, description, color, icon });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/classes'); }}>Classes</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${apiClass?.name || name || 'Class'}` : 'Add New Class'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        {isEditing && (
          <Button icon={<Brain size={16} />} onClick={() => navigate(`/classes/${classId}/logic`)}>
            Logic Rules
          </Button>
        )}
        <Button onClick={() => navigate('/classes')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={() => void handleSaveRef.current()}>Save Class</Button>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isEditing, apiClass?.name, classId, name, saving]);

  // Filter out already-bound items from dropdown options
  const availableProperties = allProperties.filter(p => !boundProperties.some(bp => bp.propertyId === p.id));
  const availablePropertyOptions = availableProperties.map(p => ({ value: p.id, label: p.name }));

  // Relations where this class is domain or range
  const classRelations = isEditing
    ? allRelations.filter(r => r.domainClassId === Number(classId) || r.rangeClassId === Number(classId))
    : [];

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'auto' }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Info Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Info size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Basic Information</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Class Name *</label>
                <Input placeholder="e.g., Person, Organization, Product" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI *</label>
                <Input placeholder="http://ontology.example.com/Person" value={uri} onChange={(e) => setUri(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea placeholder="Describe the purpose and usage of this class..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Node Color</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', height: 32 }}>
                    <ColorPicker
                      value={color}
                      onChange={(_, hex) => setColor(hex)}
                      size="small"
                    />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1 }} size="middle" />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Node Icon</label>
                  <Popover
                    open={iconPopoverOpen}
                    onOpenChange={setIconPopoverOpen}
                    trigger="click"
                    placement="bottomLeft"
                    content={
                      <div style={{ width: 340, maxHeight: 400, overflowY: 'auto' }}>
                        {ICON_CATEGORIES.map((cat) => (
                          <div key={cat.category} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, color: '#71717a', padding: '4px 4px 2px', fontWeight: 600 }}>
                              {cat.category}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                              {cat.icons.map((opt) => (
                                <div
                                  key={opt.name}
                                  onClick={() => { setIcon(opt.name); setIconPopoverOpen(false); }}
                                  style={{
                                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 6, cursor: 'pointer',
                                    border: icon === opt.name ? `2px solid ${color}` : '1px solid transparent',
                                    background: icon === opt.name ? 'rgba(139,92,246,0.1)' : 'transparent',
                                  }}
                                  title={opt.label}
                                >
                                  <opt.Icon size={18} color={icon === opt.name ? color : '#a1a1aa'} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '0 11px',
                        height: 32, borderRadius: 6, border: '1px solid #424242', cursor: 'pointer',
                        background: 'var(--background-color)',
                      }}
                    >
                      {(() => {
                        const sel = ALL_ICONS.find((o) => o.name === icon);
                        return sel ? <sel.Icon size={16} color={color} /> : <Boxes size={16} color={color} />;
                      })()}
                      <Typography.Text style={{ fontSize: 13 }}>
                        {ALL_ICONS.find((o) => o.name === icon)?.label ?? 'Boxes'}
                      </Typography.Text>
                    </div>
                  </Popover>
                </div>
              </div>
            </div>
          </Card>

          {/* Properties Card — bind/unbind mode */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <List size={20} color="var(--primary-color)" />
                <Typography.Title level={5} style={{ margin: 0 }}>Properties</Typography.Title>
              </div>
            </div>

            {/* Add property dropdown (editing mode only) */}
            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="Select a property to bind..."
                    value={selectedPropertyId}
                    onChange={(val) => setSelectedPropertyId(val)}
                    options={availablePropertyOptions}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    optionRender={(option) => {
                      const prop = availableProperties.find(p => p.id === option.value);
                      if (!prop) return option.label;
                      const meta: string[] = [prop.dataType];
                      if (prop.constraints) meta.push(prop.constraints);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 0' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{prop.name}</span>
                          <span style={{ fontSize: 12, color: '#a1a1aa' }}>{meta.join(' · ')}</span>
                        </div>
                      );
                    }}
                  />
                  <Button icon={<Plus size={16} />} onClick={() => void handleBindProperty()} disabled={!selectedPropertyId}>
                    Bind
                  </Button>
                </div>
                {selectedPropertyId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Checkbox checked={bindIsRequired} onChange={(e) => setBindIsRequired(e.target.checked)}>
                        <Typography.Text style={{ fontSize: 13 }}>Required</Typography.Text>
                      </Checkbox>
                      <Checkbox checked={bindIsUnique} onChange={(e) => setBindIsUnique(e.target.checked)}>
                        <Typography.Text style={{ fontSize: 13 }}>Unique</Typography.Text>
                      </Checkbox>
                    </div>
                    <Input
                      placeholder="Default value (optional)"
                      value={bindDefaultValue}
                      onChange={(e) => setBindDefaultValue(e.target.value)}
                      style={{ maxWidth: 280 }}
                    />
                  </div>
                )}
              </div>
            )}

            {!isEditing && (
              <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                Save the class first, then you can bind properties.
              </Typography.Text>
            )}

            {/* Bound properties list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {boundProperties.length === 0 && isEditing && (
                <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center', padding: 16 }}>No properties bound yet</Typography.Text>
              )}
              {boundProperties.map((bp) => (
                <div key={bp.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <Typography.Text strong style={{ fontSize: 13 }}>{bp.propertyName}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{bp.dataType}</Typography.Text>
                  {bp.isRequired && <Tag color="purple" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Required</Tag>}
                  {bp.isUnique && <Tag color="blue" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Unique</Tag>}
                  {bp.defaultValue && <Tag style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Default: {bp.defaultValue}</Tag>}
                  <div style={{ flex: 1 }} />
                  <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={() => void handleUnbindProperty(bp.propertyId)} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Preview Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Class Preview</Typography.Title>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {(() => {
                  const sel = ALL_ICONS.find((o) => o.name === icon);
                  return sel ? <sel.Icon size={18} color={color} /> : <Boxes size={18} color={color} />;
                })()}
                <Typography.Text strong style={{ fontSize: 15 }}>{name || 'ClassName'}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                {uri || 'http://ontology.example.com/...'}
              </Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {boundProperties.map((bp) => (
                  <div key={bp.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 13 }}>{bp.propertyName}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{bp.dataType}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Relations Card — read-only */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ArrowLeftRight size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Relations</Typography.Title>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {classRelations.length === 0 ? (
                <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center', padding: 16 }}>
                  {isEditing ? 'No relations reference this class' : 'Save the class first to see related relations'}
                </Typography.Text>
              ) : classRelations.map((rel) => {
                const cardLabel = rel.cardinality ? ({ ONE_TO_ONE: '1:1', ONE_TO_MANY: '1:N', MANY_TO_ONE: 'N:1', MANY_TO_MANY: 'N:N' } as Record<string, string>)[rel.cardinality] ?? rel.cardinality : null;
                return (
                  <div key={rel.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <Typography.Text strong style={{ fontSize: 13 }}>{rel.name}</Typography.Text>
                    {cardLabel && <Tag style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>{cardLabel}</Tag>}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{rel.domainClassName ?? '—'} → {rel.rangeClassName ?? '—'}</Typography.Text>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/classes'); }}
      />
    </>
  );
}
