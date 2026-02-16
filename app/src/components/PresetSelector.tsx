import { useState } from 'react';
import { Select, Button, Input, Flex, Typography, Popconfirm } from 'antd';
import { Save, Trash2 } from 'lucide-react';
import { type TopologyPreset, loadPresets, savePreset, deletePreset } from '../utils/topologyPresets';

interface Props {
  ontologyId: number;
  selectedClassIds: Set<number>;
  onApplyPreset: (classIds: number[]) => void;
}

export default function PresetSelector({ ontologyId, selectedClassIds, onApplyPreset }: Props) {
  const [presets, setPresets] = useState<TopologyPreset[]>(() => loadPresets(ontologyId));
  const [activePresetId, setActivePresetId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');

  const refreshPresets = () => setPresets(loadPresets(ontologyId));

  const handleSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setActivePresetId(presetId);
      onApplyPreset(preset.classIds);
    }
  };

  const handleSave = () => {
    if (!newName.trim() || selectedClassIds.size === 0) return;
    const preset: TopologyPreset = {
      id: `preset_${Date.now()}`,
      name: newName.trim(),
      classIds: Array.from(selectedClassIds),
      ontologyId,
      createdAt: new Date().toISOString(),
    };
    savePreset(preset);
    refreshPresets();
    setActivePresetId(preset.id);
    setNewName('');
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    if (activePresetId === id) setActivePresetId(undefined);
    refreshPresets();
  };

  return (
    <Flex align="center" gap={8}>
      <Select
        placeholder="Select preset..."
        value={activePresetId}
        onChange={handleSelect}
        style={{ minWidth: 180 }}
        allowClear
        onClear={() => setActivePresetId(undefined)}
        options={presets.map((p) => ({ label: p.name, value: p.id }))}
        popupRender={(menu) => (
          <>
            {menu}
            {presets.length > 0 && activePresetId && (
              <div style={{ padding: '4px 8px', borderTop: '1px solid #303030' }}>
                <Popconfirm
                  title="Delete this preset?"
                  onConfirm={() => handleDelete(activePresetId)}
                >
                  <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
                    Delete selected
                  </Button>
                </Popconfirm>
              </div>
            )}
          </>
        )}
      />
      {saving ? (
        <Flex align="center" gap={4}>
          <Input
            size="small"
            placeholder="Preset name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleSave}
            style={{ width: 140 }}
            autoFocus
          />
          <Button size="small" type="primary" onClick={handleSave} disabled={!newName.trim() || selectedClassIds.size === 0}>
            Save
          </Button>
          <Button size="small" onClick={() => setSaving(false)}>Cancel</Button>
        </Flex>
      ) : (
        <Button
          size="small"
          icon={<Save size={14} />}
          onClick={() => setSaving(true)}
          disabled={selectedClassIds.size === 0}
        >
          Save Preset
        </Button>
      )}
      {selectedClassIds.size > 0 && (
        <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>
          {selectedClassIds.size} class{selectedClassIds.size > 1 ? 'es' : ''} selected
        </Typography.Text>
      )}
    </Flex>
  );
}
