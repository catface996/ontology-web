import {
  Box, Breadcrumbs, Link, Typography, Button, Select, MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import {
  ChevronRight, ChevronDown, Database, GitMerge, Share2, Key,
  ArrowRight, Sparkles, Plus, Save, Link as LinkIcon, Trash2, TriangleAlert,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useState } from 'react';

/* ── Types ── */
interface SourceField {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface MappingItem {
  source: string;
  target: string;
  transform: string;
}

interface TargetField {
  name: string;
  type: string;
}

/* ── Static data ── */
const allSourceFields: SourceField[] = [
  { name: 'id',         type: 'INTEGER',      isPrimary: true },
  { name: 'username',   type: 'VARCHAR(50)' },
  { name: 'email',      type: 'VARCHAR(100)' },
  { name: 'created_at', type: 'TIMESTAMP' },
];

const allTargetFields: TargetField[] = [
  { name: 'personId',    type: 'xsd:integer' },
  { name: 'name',        type: 'xsd:string' },
  { name: 'email',       type: 'xsd:string' },
  { name: 'createdDate', type: 'xsd:dateTime' },
  { name: 'belongsTo',   type: 'Organization' },
];

const initialMappings: MappingItem[] = [
  { source: 'id',       target: 'personId', transform: 'Direct mapping' },
  { source: 'username', target: 'name',     transform: 'Direct mapping' },
  { source: 'email',    target: 'email',    transform: 'Direct mapping' },
];

const transformOptions = ['Direct mapping', 'Uppercase', 'Lowercase', 'Trim', 'Custom'];

/* ── Connector dot ── */
function ConnectorDot({ filled }: { filled: boolean }) {
  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        flexShrink: 0,
        ...(filled
          ? { bgcolor: 'primary.main' }
          : { border: 2, borderColor: 'divider' }),
      }}
    />
  );
}

/* ── Field row ── */
function FieldRow({
  name,
  type,
  mapped,
  isPrimary,
  connectorSide,
}: {
  name: string;
  type: string;
  mapped: boolean;
  isPrimary?: boolean;
  connectorSide: 'left' | 'right';
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        ...(mapped
          ? { bgcolor: 'rgba(139,92,246,0.12)' }
          : { border: 1, borderColor: 'divider' }),
      }}
    >
      {connectorSide === 'right' && (
        <>
          <Box display="flex" alignItems="center" gap={1}>
            {isPrimary && <Key size={14} />}
            <Typography fontSize={13} fontWeight={500}>{name}</Typography>
          </Box>
          <Typography fontSize={11} color="text.secondary">{type}</Typography>
          <ConnectorDot filled={mapped} />
        </>
      )}
      {connectorSide === 'left' && (
        <>
          <ConnectorDot filled={mapped} />
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={13} fontWeight={500}>{name}</Typography>
          </Box>
          <Typography fontSize={11} color="text.secondary">{type}</Typography>
        </>
      )}
    </Box>
  );
}

/* ── Selector ── */
function PanelSelector({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select
      size="small"
      value={value}
      onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      IconComponent={ChevronDown}
      sx={{
        width: '100%',
        borderRadius: 2,
        bgcolor: 'action.hover',
        fontSize: 13,
        fontWeight: 500,
        '& .MuiSelect-select': { py: 1.25, px: 1.5 },
        '& .MuiSelect-icon': { width: 16, height: 16, right: 12, top: 'calc(50% - 8px)' },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>{opt}</MenuItem>
      ))}
    </Select>
  );
}

/* ── Inline dropdown for add‑mapping form ── */
function InlineSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select
      size="small"
      displayEmpty
      value={value}
      onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      IconComponent={ChevronDown}
      renderValue={(v) => v || <span style={{ color: '#71717a' }}>{placeholder}</span>}
      sx={{
        width: '100%',
        borderRadius: 2,
        bgcolor: 'action.hover',
        fontSize: 12,
        '& .MuiSelect-select': { py: 1, px: 1.5 },
        '& .MuiSelect-icon': { width: 14, height: 14, right: 10, top: 'calc(50% - 7px)' },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>
      ))}
    </Select>
  );
}

/* ── Page ── */
export default function FieldMappingPage() {
  const [source, setSource] = useState('PostgreSQL / users');
  const [target, setTarget] = useState('Person (Class)');

  // Mapping state
  const [mappingList, setMappingList] = useState<MappingItem[]>(initialMappings);

  // Add mapping state
  const [adding, setAdding] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newTransform, setNewTransform] = useState('Direct mapping');

  // Delete mapping state
  const [deletingSource, setDeletingSource] = useState<string | null>(null);

  // Save success modal
  const [saveOpen, setSaveOpen] = useState(false);

  // Derived mapped sets
  const mappedSourceNames = new Set(mappingList.map((m) => m.source));
  const mappedTargetNames = new Set(mappingList.map((m) => m.target));

  // Unmapped options for add form
  const unmappedSources = allSourceFields.filter((f) => !mappedSourceNames.has(f.name)).map((f) => f.name);
  const unmappedTargets = allTargetFields.filter((f) => !mappedTargetNames.has(f.name)).map((f) => f.name);

  const mappedCount = mappingList.length;
  const totalCount = allSourceFields.length;

  const handleConfirmAdd = () => {
    if (!newSource || !newTarget) return;
    setMappingList((prev) => [...prev, { source: newSource, target: newTarget, transform: newTransform }]);
    setAdding(false);
    setNewSource('');
    setNewTarget('');
    setNewTransform('Direct mapping');
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewSource('');
    setNewTarget('');
    setNewTransform('Direct mapping');
  };

  const handleConfirmDelete = (sourceKey: string) => {
    setMappingList((prev) => prev.filter((m) => m.source !== sourceKey));
    setDeletingSource(null);
  };

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Integrations
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Field Mapping
          </Typography>
        </Breadcrumbs>

        <Box display="flex" gap={1.5}>
          <Button variant="outlined" size="small" startIcon={<Sparkles size={16} />}>
            Auto Mapping
          </Button>
          <Button variant="contained" size="small" startIcon={<Save size={16} />} onClick={() => setSaveOpen(true)}>
            Save Mapping
          </Button>
        </Box>
      </Box>

      {/* Content — three‑panel layout */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="hidden">
        {/* ── Source Fields ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Database size={20} color="#336791" />
              <Typography fontSize={16} fontWeight={600}>Source Fields</Typography>
            </Box>
            <PanelSelector
              value={source}
              options={['PostgreSQL / users', 'PostgreSQL / orders', 'MySQL / products']}
              onChange={setSource}
            />
          </Box>
          <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
            {allSourceFields.map((f) => (
              <FieldRow
                key={f.name}
                name={f.name}
                type={f.type}
                mapped={mappedSourceNames.has(f.name)}
                isPrimary={f.isPrimary}
                connectorSide="right"
              />
            ))}
          </Box>
        </Box>

        {/* ── Field Mappings ── */}
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <GitMerge size={20} />
              <Typography fontSize={16} fontWeight={600}>Field Mappings</Typography>
            </Box>
            <Typography fontSize={12} color="text.secondary">
              {mappedCount} of {totalCount} fields mapped
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
            {mappingList.map((m) =>
              deletingSource === m.source ? (
                /* ── Delete confirmation ── */
                <Box
                  key={m.source}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'error.main',
                    bgcolor: 'rgba(239,68,68,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography fontSize={13} fontWeight={500}>{m.source}</Typography>
                    <ArrowRight size={14} />
                    <Typography fontSize={13} fontWeight={500}>{m.target}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Sparkles size={12} color="#a1a1aa" />
                    <Typography fontSize={11} color="text.secondary">{m.transform}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                    <TriangleAlert size={13} color="#ef4444" />
                    <Typography fontSize={12} color="error.main" fontWeight={500}>
                      Remove this mapping?
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => setDeletingSource(null)}
                      sx={{ fontSize: 12, py: 0.5 }}
                    >
                      Keep
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      color="error"
                      startIcon={<Trash2 size={13} />}
                      onClick={() => handleConfirmDelete(m.source)}
                      sx={{ fontSize: 12, py: 0.5 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ) : (
                /* ── Normal mapping row with hover trash ── */
                <Box
                  key={m.source}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(139,92,246,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    position: 'relative',
                    '&:hover .delete-btn': { opacity: 1 },
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography fontSize={13} fontWeight={500}>{m.source}</Typography>
                    <ArrowRight size={14} />
                    <Typography fontSize={13} fontWeight={500}>{m.target}</Typography>
                    <Box
                      className="delete-btn"
                      onClick={() => setDeletingSource(m.source)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        ml: 0.5,
                        color: 'error.main',
                        '&:hover': { color: 'error.light' },
                      }}
                    >
                      <Trash2 size={14} />
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Sparkles size={12} color="#a1a1aa" />
                    <Typography fontSize={11} color="text.secondary">{m.transform}</Typography>
                  </Box>
                </Box>
              ),
            )}

            {/* Add Mapping — form or button */}
            {adding ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(139,92,246,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                <Box display="flex" alignItems="center" gap={0.75}>
                  <LinkIcon size={14} />
                  <Typography fontSize={13} fontWeight={600}>New Mapping</Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box>
                    <Typography fontSize={11} color="text.secondary" mb={0.5}>Source Field</Typography>
                    <InlineSelect
                      value={newSource}
                      options={unmappedSources}
                      placeholder="Select source field"
                      onChange={setNewSource}
                    />
                  </Box>
                  <Box>
                    <Typography fontSize={11} color="text.secondary" mb={0.5}>Target Property</Typography>
                    <InlineSelect
                      value={newTarget}
                      options={unmappedTargets}
                      placeholder="Select target property"
                      onChange={setNewTarget}
                    />
                  </Box>
                  <Box>
                    <Typography fontSize={11} color="text.secondary" mb={0.5}>Transform</Typography>
                    <InlineSelect
                      value={newTransform}
                      options={transformOptions}
                      placeholder="Select transform"
                      onChange={setNewTransform}
                    />
                  </Box>
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={handleCancelAdd}
                    sx={{ fontSize: 12, py: 0.5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={!newSource || !newTarget}
                    onClick={handleConfirmAdd}
                    sx={{ fontSize: 12, py: 0.5 }}
                  >
                    Confirm
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => setAdding(true)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  py: 1.25,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'text.secondary' },
                }}
              >
                <Plus size={14} color="#a1a1aa" />
                <Typography fontSize={13} color="text.secondary">Add Mapping</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Target Properties ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Share2 size={20} />
              <Typography fontSize={16} fontWeight={600}>Target Properties</Typography>
            </Box>
            <PanelSelector
              value={target}
              options={['Person (Class)', 'Organization (Class)', 'Event (Class)']}
              onChange={setTarget}
            />
          </Box>
          <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
            {allTargetFields.map((f) => (
              <FieldRow
                key={f.name}
                name={f.name}
                type={f.type}
                mapped={mappedTargetNames.has(f.name)}
                connectorSide="left"
              />
            ))}
          </Box>
        </Box>
      </Box>

      <SuccessModal
        open={saveOpen}
        title="Save Successful"
        description="The field mapping configuration has been saved successfully. Changes will take effect on the next sync."
        onClose={() => setSaveOpen(false)}
      />
    </>
  );
}
