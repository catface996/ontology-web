import { useState, useRef } from 'react';
import {
  Box, Breadcrumbs, Link, Typography, Button, Card, Checkbox, FormControlLabel,
  Select, MenuItem, FormControl,
} from '@mui/material';
import {
  ChevronRight, Upload, Download, CloudUpload, FolderOpen, History,
  Braces, FileCode, FileText, Table as TableIcon,
} from 'lucide-react';

/* ── Types ── */
type ExportScope = 'all' | 'schema' | 'instances';
type ExportFormat = 'json-ld' | 'rdf-xml' | 'turtle' | 'csv';

/* ── Export scope options ── */
const scopeOptions: { value: ExportScope; label: string; description: string }[] = [
  { value: 'all', label: 'All Data', description: 'Classes, Relations, Properties, Instances' },
  { value: 'schema', label: 'Schema Only', description: 'Classes, Relations, Properties' },
  { value: 'instances', label: 'Instances Only', description: 'Data without schema' },
];

/* ── Export format options ── */
const formatOptions: {
  value: ExportFormat;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { value: 'json-ld', label: 'JSON-LD', icon: Braces },
  { value: 'rdf-xml', label: 'RDF/XML', icon: FileCode },
  { value: 'turtle', label: 'Turtle', icon: FileText },
  { value: 'csv', label: 'CSV', icon: TableIcon },
];

/* ── Main component ── */
export default function ImportExportPage() {
  const [importFormat, setImportFormat] = useState('auto');
  const [targetDomain, setTargetDomain] = useState('enterprise');
  const [validateData, setValidateData] = useState(true);
  const [mergeData, setMergeData] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json-ld');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
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
            Tools
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Import / Export
          </Typography>
        </Breadcrumbs>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <History size={16} />
          <Typography variant="body2" fontWeight={500} fontSize={14}>
            History
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="hidden">
        {/* ── Import Card ── */}
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Import Header */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            height={56}
            px={2.5}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Upload size={20} color="#8b5cf6" />
            <Typography fontSize={16} fontWeight={600}>
              Import Data
            </Typography>
          </Box>

          {/* Import Content */}
          <Box
            flex={1}
            p={2.5}
            display="flex"
            flexDirection="column"
            gap={2.5}
            overflow="auto"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".rdf,.owl,.ttl,.jsonld,.json,.xml,.csv"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* Upload Zone */}
            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              sx={{
                height: 250,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                borderRadius: 3,
                border: 2,
                borderStyle: 'dashed',
                borderColor: isDragOver ? 'primary.main' : 'divider',
                bgcolor: isDragOver ? 'rgba(139, 92, 246, 0.05)' : 'action.hover',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {selectedFiles.length > 0 ? (
                <>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={28} color="#8b5cf6" />
                  </Box>
                  {selectedFiles.map((f, i) => (
                    <Typography key={i} color="text.primary" fontSize={14}>
                      {f.name}
                      <Typography component="span" color="text.secondary" fontSize={13} ml={1}>
                        ({(f.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Typography>
                  ))}
                  <Typography color="text.secondary" fontSize={13}>
                    Click to change files
                  </Typography>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloudUpload size={28} color="#8b5cf6" />
                  </Box>
                  <Typography color="text.secondary" fontSize={15}>
                    Drag and drop files here, or click to browse
                  </Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    Supports RDF, OWL, TTL, JSON-LD (max 50MB)
                  </Typography>
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<FolderOpen size={16} />}
                    size="small"
                    sx={{ px: 2.5, py: 1.25, borderRadius: 2 }}
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </Box>

            {/* Options Row */}
            <Box display="flex" gap={2}>
              {/* Import Format */}
              <Box flex={1} display="flex" flexDirection="column" gap={1}>
                <Typography fontSize={13} fontWeight={500}>
                  Import Format
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="auto">Auto-detect</MenuItem>
                    <MenuItem value="rdf">RDF/XML</MenuItem>
                    <MenuItem value="ttl">Turtle</MenuItem>
                    <MenuItem value="jsonld">JSON-LD</MenuItem>
                    <MenuItem value="owl">OWL</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Target Domain */}
              <Box flex={1} display="flex" flexDirection="column" gap={1}>
                <Typography fontSize={13} fontWeight={500}>
                  Target Domain
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    sx={{ borderRadius: 2 }}
                    renderValue={(val) => (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 1,
                            bgcolor: '#A855F7',
                          }}
                        />
                        {val === 'enterprise' ? 'Enterprise' : val}
                      </Box>
                    )}
                  >
                    <MenuItem value="enterprise">Enterprise</MenuItem>
                    <MenuItem value="research">Research</MenuItem>
                    <MenuItem value="healthcare">Healthcare</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Checkboxes */}
            <Box display="flex" flexDirection="column" gap={0.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={validateData}
                    onChange={(e) => setValidateData(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5, mr: 0.5 }}
                  />
                }
                label={
                  <Typography fontSize={13}>Validate data before import</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mergeData}
                    onChange={(e) => setMergeData(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5, mr: 0.5 }}
                  />
                }
                label={
                  <Typography fontSize={13}>Merge with existing data</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5, mr: 0.5 }}
                  />
                }
                label={
                  <Typography fontSize={13} color="text.secondary">
                    Skip duplicate entries
                  </Typography>
                }
              />
            </Box>

            {/* Import Button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<Upload size={18} />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 14,
                mt: 'auto',
              }}
            >
              Start Import
            </Button>
          </Box>
        </Card>

        {/* ── Export Card ── */}
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Export Header */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            height={56}
            px={2.5}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Download size={20} color="#8b5cf6" />
            <Typography fontSize={16} fontWeight={600}>
              Export Data
            </Typography>
          </Box>

          {/* Export Content */}
          <Box
            flex={1}
            p={2.5}
            display="flex"
            flexDirection="column"
            gap={2.5}
            overflow="auto"
          >
            {/* Export Scope */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography fontSize={13} fontWeight={500}>
                Export Scope
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {scopeOptions.map((opt) => {
                  const selected = exportScope === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => setExportScope(opt.value)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: 1,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'primary.main' : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: selected ? 'primary.main' : 'text.secondary',
                        },
                      }}
                    >
                      {/* Radio indicator */}
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: 2,
                          borderColor: selected ? '#fff' : 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {selected && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#fff',
                            }}
                          />
                        )}
                      </Box>
                      <Typography fontSize={13} color={selected ? '#fff' : 'text.primary'}>
                        {opt.label}{' '}
                        <Typography
                          component="span"
                          fontSize={13}
                          color={selected ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                        >
                          ({opt.description})
                        </Typography>
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Export Format */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography fontSize={13} fontWeight={500}>
                Export Format
              </Typography>
              <Box display="flex" gap={1.5}>
                {formatOptions.map(({ value, label, icon: Icon }) => {
                  const selected = exportFormat === value;
                  return (
                    <Box
                      key={value}
                      onClick={() => setExportFormat(value)}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        py: 2,
                        px: 1,
                        borderRadius: 2,
                        border: selected ? 2 : 1,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'background.paper' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: selected ? 'primary.main' : 'text.secondary',
                        },
                      }}
                    >
                      <Icon
                        size={24}
                        color={selected ? '#8b5cf6' : '#a1a1aa'}
                      />
                      <Typography
                        fontSize={13}
                        fontWeight={selected ? 500 : 400}
                        color={selected ? 'text.primary' : 'text.secondary'}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Export Button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<Download size={18} />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 14,
                mt: 'auto',
              }}
            >
              Export Data
            </Button>
          </Box>
        </Card>
      </Box>
    </>
  );
}
