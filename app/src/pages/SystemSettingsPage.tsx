import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Switch, Button } from 'antd';
import { Save, ChevronDown } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
interface SettingRow {
  label: string;
  description: string;
}

/* -- Page -- */
export default function SystemSettingsPage() {
  const [reasonerEngine] = useState('HermiT');
  const [autoConsistency, setAutoConsistency] = useState(true);
  const [baseUri] = useState('https://enterprise.ontology.io/schema#');
  const [defaultPrefix] = useState('ent:');
  const [interfaceLang] = useState('English (en)');
  const [showUris, setShowUris] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  /* Reusable row with label + description */
  const RowLabel = ({ label, description }: SettingRow) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>{label}</Typography.Text>
      <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{description}</Typography.Text>
    </div>
  );

  /* Dropdown-style select (visual only) */
  const SelectBox = ({ value, width = 200 }: { value: string; width?: number }) => (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderRadius: 8,
        border: '1px solid #303030', width, cursor: 'pointer',
      }}
    >
      <Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono', flex: 1 }}>{value}</Typography.Text>
      <ChevronDown size={14} color="#a1a1aa" />
    </div>
  );

  /* Text input (visual only) */
  const InputBox = ({ value, width = 360 }: { value: string; width?: number }) => (
    <div
      style={{
        padding: '8px 12px', borderRadius: 8,
        border: '1px solid #303030', width,
      }}
    >
      <Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono' }}>{value}</Typography.Text>
    </div>
  );

  /* Settings card */
  const SettingsCard = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <div
      style={{
        borderRadius: 12, border: '1px solid #303030',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography.Text>
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{description}</Typography.Text>
      </div>
      {children}
    </div>
  );

  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'System Settings' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<Save size={16} />}>
        Save Changes
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
        {/* Reasoner Configuration */}
        <SettingsCard title="Reasoner Configuration" description="Configure the OWL reasoner used for consistency checking and inference.">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Reasoner Engine" description="Select the reasoning engine for ontology inference" />
            <SelectBox value={reasonerEngine} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Auto-run Consistency Check" description="Automatically check ontology consistency after each change" />
            <Switch checked={autoConsistency} onChange={() => setAutoConsistency(!autoConsistency)} />
          </div>
        </SettingsCard>

        {/* Default Namespace */}
        <SettingsCard title="Default Namespace" description="Set the default namespace URI for new ontology entities.">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Base URI" description="The base URI prefix for all new entities" />
            <InputBox value={baseUri} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Default Prefix" description="Short prefix alias for the base URI" />
            <InputBox value={defaultPrefix} width={200} />
          </div>
        </SettingsCard>

        {/* Language & Display */}
        <SettingsCard title="Language & Display" description="Configure language preferences and display options for the ontology editor.">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Interface Language" description="Language for UI labels and descriptions" />
            <SelectBox value={interfaceLang} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Show URIs in Editor" description="Display full URIs instead of prefixed names" />
            <Switch checked={showUris} onChange={() => setShowUris(!showUris)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RowLabel label="Dark Mode" description="Use dark theme for the interface" />
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
        </SettingsCard>
      </div>
    </>
  );
}
