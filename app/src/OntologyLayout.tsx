import React, { useState } from 'react';
import { Divider, Input, Button, Breadcrumb, Typography } from 'antd';
import {
  Share2,
  ChevronDown,
  ChevronRight,
  Globe,
  Building2,
  Wallet,
  Cpu,
  GitBranch,
  Boxes,
  Link as LinkIcon,
  List as ListIcon,
  Database,
  Search,
  Upload,
  Plus,
  X,
} from 'lucide-react';

const drawerWidth = 280;
const propertiesPanelWidth = 320;

interface NavItemData {
  icon: React.ReactNode;
  label: string;
}

interface DomainData {
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
}

export default function OntologyLayout() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    domains: true,
    ontologies: true,
    tools: true,
  });
  const [selectedNav, setSelectedNav] = useState('Topology');

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const domains: DomainData[] = [
    { icon: <Globe size={18} />, label: 'Enterprise', color: '#f4f4f5', active: true },
    { icon: <Building2 size={18} />, label: 'Healthcare', color: '#22D3EE' },
    { icon: <Wallet size={18} />, label: 'Finance', color: '#F472B6' },
    { icon: <Cpu size={18} />, label: 'IoT & Sensors', color: '#4ADE80' },
  ];

  const ontologyNavItems: NavItemData[] = [
    { icon: <GitBranch size={20} />, label: 'Topology' },
    { icon: <Boxes size={20} />, label: 'Classes' },
    { icon: <LinkIcon size={20} />, label: 'Relations' },
    { icon: <ListIcon size={20} />, label: 'Properties' },
    { icon: <Database size={20} />, label: 'Instances' },
  ];

  const toolsNavItems: NavItemData[] = [
    { icon: <Search size={20} />, label: 'SPARQL Query' },
    { icon: <Upload size={20} />, label: 'Import/Export' },
  ];

  const renderSection = (title: string, key: string, items: NavItemData[]) => (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', cursor: 'pointer' }} onClick={() => toggleSection(key)}>
        <span style={{ fontSize: 12, color: '#a1a1aa' }}>{title}</span>
        {openSections[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {openSections[key] && (
        <div>
          {items.map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: selectedNav === item.label ? '#1a1a24' : 'transparent' }}
              onClick={() => setSelectedNav(item.label)}
            >
              <span style={{ display: 'flex' }}>{item.icon}</span>
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: drawerWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #27273a', backgroundColor: '#0d0d14', height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Share2 size={24} />
          <span style={{ fontSize: 20, fontWeight: 600 }}>Ontology</span>
        </div>
        <Divider style={{ margin: 0, borderColor: '#27273a' }} />

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {/* Domains */}
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', cursor: 'pointer' }} onClick={() => toggleSection('domains')}>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>DOMAINS</span>
              {openSections.domains ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {openSections.domains && (
              <div>
                {domains.map((domain) => (
                  <div key={domain.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: domain.active ? '#1a1a24' : 'transparent' }}>
                    <span style={{ display: 'flex', color: domain.active ? '#f4f4f5' : domain.color }}>{domain.icon}</span>
                    <span style={{ fontSize: 14 }}>{domain.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Divider style={{ margin: 0, borderColor: '#27273a' }} />

          {renderSection('ONTOLOGIES', 'ontologies', ontologyNavItems)}
          {renderSection('TOOLS', 'tools', toolsNavItems)}
        </div>

        {/* Footer */}
        <Divider style={{ margin: 0, borderColor: '#27273a' }} />
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, display: 'block' }}>Admin User</span>
            <span style={{ fontSize: 12, color: '#71717a', display: 'block' }}>admin@ontology.io</span>
          </div>
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #27273a' }}>
          <Breadcrumb
            separator={<ChevronRight size={14} />}
            items={[
              { title: <a href="#">Ontologies</a> },
              { title: <Typography.Text strong>{selectedNav}</Typography.Text> },
            ]}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <Input
              placeholder="Search classes..."
              prefix={<Search size={16} />}
              style={{ width: 240 }}
            />
            <Button type="primary" icon={<Plus size={16} />}>New Class</Button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Search Panel */}
          <div style={{ width: 280, borderRight: '1px solid #27273a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #27273a' }}>
              <span style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Classes</span>
              <Input
                placeholder="Filter classes..."
                prefix={<Search size={16} />}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {['Person', 'Organization', 'Product', 'Event', 'Location'].map((cls) => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: 'transparent' }}>
                  <span style={{ fontSize: 14 }}>{cls}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'block' }}>Graph Canvas</span>
            <div style={{ flex: 1, border: '1px solid #27273a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#71717a' }}>Topology Visualization</span>
            </div>
          </div>

          {/* Properties Panel */}
          <div style={{ width: propertiesPanelWidth, borderLeft: '1px solid #27273a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #27273a' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Class Properties</span>
              <Button type="text" size="small" icon={<X size={20} />} />
            </div>
            <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>SELECTED CLASS</span>
              <div style={{ padding: 12, marginTop: 8, marginBottom: 16, backgroundColor: '#111118', border: '1px solid #27273a', borderRadius: 4 }}>
                <span style={{ fontSize: 14 }}>Person</span>
              </div>
              <Divider style={{ margin: '16px 0', borderColor: '#27273a' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>BASIC PROPERTIES</span>
              <div>
                {['name', 'email', 'birthDate', 'address'].map((prop) => (
                  <div key={prop} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: 'transparent' }}>
                    <span style={{ fontSize: 14 }}>{prop}</span>
                  </div>
                ))}
              </div>
              <Divider style={{ margin: '16px 0', borderColor: '#27273a' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>RELATIONS</span>
              <div>
                {['worksAt → Organization', 'knows → Person', 'livesIn → Location'].map((rel) => (
                  <div key={rel} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: 'transparent' }}>
                    <span style={{ fontSize: 14 }}>{rel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
