import { useState, useRef, useEffect } from 'react';
import { Breadcrumb, Typography, Button, Card, Checkbox, Select } from 'antd';
import {
  ChevronRight, Upload, Download, CloudUpload,
  FolderOpen, Clock, FileText, Code,
  Table,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

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
  { value: 'json-ld', label: 'JSON-LD', icon: Code },
  { value: 'rdf-xml', label: 'RDF/XML', icon: Code },
  { value: 'turtle', label: 'Turtle', icon: FileText },
  { value: 'csv', label: 'CSV', icon: Table },
];

/* ── Main component ── */
export default function ImportExportPage() {
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a>Tools</a> },
          { title: <Typography.Text strong>Import / Export</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button icon={<Clock size={16} />}>History</Button>
    );
  }, [setBreadcrumbs, setActions]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  return (
    <>
      {/* Main Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
        {/* ── Import Card ── */}
        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
        >
          {/* Import Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 56, padding: '0 20px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Upload size={20} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Import Data</Typography.Text>
          </div>

          {/* Import Content */}
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
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
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              style={{
                height: 250,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                borderRadius: 12,
                border: `2px dashed ${isDragOver ? 'var(--primary-color)' : 'rgba(255,255,255,0.12)'}`,
                background: isDragOver ? 'rgba(var(--primary-rgb), 0.05)' : 'rgba(255,255,255,0.04)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {selectedFiles.length > 0 ? (
                <>
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(var(--primary-rgb), 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FileText size={28} color="var(--primary-color)" />
                  </div>
                  {selectedFiles.map((f, i) => (
                    <Typography.Text key={i}>
                      {f.name}
                      <Typography.Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                        ({(f.size / 1024).toFixed(1)} KB)
                      </Typography.Text>
                    </Typography.Text>
                  ))}
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    Click to change files
                  </Typography.Text>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(var(--primary-rgb), 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CloudUpload size={28} color="var(--primary-color)" />
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Drag and drop files here, or click to browse
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    Supports RDF, OWL, TTL, JSON-LD (max 50MB)
                  </Typography.Text>
                  <Button type="primary" icon={<FolderOpen size={16} />}>
                    Browse Files
                  </Button>
                </>
              )}
            </div>

            {/* Options Row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Import Format */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Import Format</Typography.Text>
                <Select
                  style={{ width: '100%' }}
                  value={importFormat}
                  onChange={(val) => setImportFormat(val)}
                  options={[
                    { value: 'auto', label: 'Auto-detect' },
                    { value: 'rdf', label: 'RDF/XML' },
                    { value: 'ttl', label: 'Turtle' },
                    { value: 'jsonld', label: 'JSON-LD' },
                    { value: 'owl', label: 'OWL' },
                    { value: 'csv', label: 'CSV' },
                  ]}
                />
              </div>

              {/* Target Domain */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Target Domain</Typography.Text>
                <Select
                  style={{ width: '100%' }}
                  value={targetDomain}
                  onChange={(val) => setTargetDomain(val)}
                  options={[
                    { value: 'enterprise', label: 'Enterprise' },
                    { value: 'research', label: 'Research' },
                    { value: 'healthcare', label: 'Healthcare' },
                  ]}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Checkbox checked={validateData} onChange={(e) => setValidateData(e.target.checked)}>
                <Typography.Text style={{ fontSize: 13 }}>Validate data before import</Typography.Text>
              </Checkbox>
              <Checkbox checked={mergeData} onChange={(e) => setMergeData(e.target.checked)}>
                <Typography.Text style={{ fontSize: 13 }}>Merge with existing data</Typography.Text>
              </Checkbox>
              <Checkbox checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>Skip duplicate entries</Typography.Text>
              </Checkbox>
            </div>

            {/* Import Button */}
            <Button
              type="primary"
              block
              icon={<Upload size={16} />}
              style={{ marginTop: 'auto' }}
            >
              Start Import
            </Button>
          </div>
        </Card>

        {/* ── Export Card ── */}
        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
        >
          {/* Export Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 56, padding: '0 20px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Download size={20} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Export Data</Typography.Text>
          </div>

          {/* Export Content */}
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
            {/* Export Scope */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Export Scope</Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scopeOptions.map((opt) => {
                  const selected = exportScope === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setExportScope(opt.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1px solid ${selected ? 'var(--primary-color)' : 'rgba(255,255,255,0.12)'}`,
                        background: selected ? 'var(--primary-color)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Radio indicator */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${selected ? '#fff' : 'rgba(255,255,255,0.12)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {selected && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#fff',
                            }}
                          />
                        )}
                      </div>
                      <Typography.Text style={{ fontSize: 13, color: selected ? '#fff' : undefined }}>
                        {opt.label}{' '}
                        <Typography.Text
                          style={{
                            fontSize: 13,
                            color: selected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                          }}
                        >
                          ({opt.description})
                        </Typography.Text>
                      </Typography.Text>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Format */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Export Format</Typography.Text>
              <div style={{ display: 'flex', gap: 12 }}>
                {formatOptions.map(({ value, label, icon: Icon }) => {
                  const selected = exportFormat === value;
                  return (
                    <div
                      key={value}
                      onClick={() => setExportFormat(value)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '16px 8px',
                        borderRadius: 8,
                        border: `${selected ? '2px' : '1px'} solid ${selected ? 'var(--primary-color)' : 'rgba(255,255,255,0.12)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={24} color={selected ? 'var(--primary-color)' : '#a1a1aa'} />
                      <Typography.Text
                        style={{
                          fontSize: 13,
                          fontWeight: selected ? 500 : 400,
                          color: selected ? undefined : 'rgba(255,255,255,0.45)',
                        }}
                      >
                        {label}
                      </Typography.Text>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Button */}
            <Button
              type="primary"
              block
              icon={<Download size={16} />}
              style={{ marginTop: 'auto' }}
            >
              Export Data
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
