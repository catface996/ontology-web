import { Breadcrumb, Typography, Button, Select, Spin, message } from 'antd';
import {
  ChevronDown, Database,
  ArrowRight, Zap, Plus, Save, Pencil,
  ArrowLeftRight, Trash2, Check, AlertTriangle,
  KeyRound, Share2, GitMerge, ArrowLeft,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listDataSources, getDataSource } from '../services/dataSourceService';
import { listMappingConfigs, saveMappingConfig, deleteMappingConfig } from '../services/dataSourceService';
import { listClasses, listClassProperties } from '../services/coreService';
import type { DataSourceDTO, FieldMappingConfigDTO, ColumnMappingItem, TransformType, TableSchema, ColumnSchema } from '../types/datasource';
import type { ClassDTO, ClassPropertyDTO } from '../services/coreService';

/* -- Transform options -- */
const transformOptions: { value: TransformType; label: string }[] = [
  { value: 'DIRECT', label: 'Direct mapping' },
  { value: 'UPPERCASE', label: 'Uppercase' },
  { value: 'LOWERCASE', label: 'Lowercase' },
  { value: 'TRIM', label: 'Trim' },
  { value: 'CUSTOM', label: 'Custom' },
];

const transformLabels: Record<TransformType, string> = {
  DIRECT: 'Direct mapping',
  UPPERCASE: 'Uppercase',
  LOWERCASE: 'Lowercase',
  TRIM: 'Trim',
  CUSTOM: 'Custom',
};

/* -- Type mismatch detection -- */
const SQL_NUMERIC_TYPES = /^(int|integer|bigint|smallint|tinyint|float|double|decimal|numeric|real)/i;
const SQL_STRING_TYPES = /^(varchar|char|text|clob|nvarchar|nchar)/i;
const SQL_DATE_TYPES = /^(date|time|timestamp|datetime)/i;

function hasTypeMismatch(sourceType: string, targetType: string): boolean {
  const src = sourceType.toLowerCase();
  const tgt = targetType.toLowerCase();
  if (SQL_NUMERIC_TYPES.test(src) && tgt.includes('string')) return true;
  if (SQL_STRING_TYPES.test(src) && tgt.includes('integer')) return true;
  if (SQL_STRING_TYPES.test(src) && tgt.includes('decimal')) return true;
  if (SQL_DATE_TYPES.test(src) && tgt.includes('string')) return true;
  if (SQL_STRING_TYPES.test(src) && tgt.includes('datetime')) return true;
  return false;
}

/* -- Connector dot -- */
function ConnectorDot({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        flexShrink: 0,
        ...(filled
          ? { background: 'var(--primary-color)' }
          : { border: '2px solid rgba(255,255,255,0.12)' }),
      }}
    />
  );
}

/* -- Field row -- */
function FieldRow({
  name,
  type,
  mapped,
  active,
  isPrimary,
  connectorSide,
}: {
  name: string;
  type: string;
  mapped: boolean;
  active?: boolean;
  isPrimary?: boolean;
  connectorSide: 'left' | 'right';
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 8,
  };

  const stateStyle: React.CSSProperties = active
    ? { background: 'rgba(139,92,246,0.08)', border: '1.5px solid var(--primary-color)' }
    : mapped
      ? { background: 'rgba(139,92,246,0.12)' }
      : { border: '1px solid rgba(255,255,255,0.12)' };

  return (
    <div style={{ ...baseStyle, ...stateStyle }}>
      {connectorSide === 'right' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPrimary && <KeyRound size={14} />}
            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Typography.Text>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{type}</Typography.Text>
          <ConnectorDot filled={mapped} />
        </>
      )}
      {connectorSide === 'left' && (
        <>
          <ConnectorDot filled={mapped} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Typography.Text>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{type}</Typography.Text>
        </>
      )}
    </div>
  );
}

/* -- Page -- */
export default function FieldMappingPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // View mode (readonly) vs edit mode
  const isViewMode = searchParams.get('mode') === 'view';

  // Data source state
  const [allDataSources, setAllDataSources] = useState<DataSourceDTO[]>([]);
  const [selectedDsId, setSelectedDsId] = useState<number | null>(
    searchParams.get('dataSourceId') ? Number(searchParams.get('dataSourceId')) : null
  );
  const [_currentDs, setCurrentDs] = useState<DataSourceDTO | null>(null);

  // Schema state
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(
    searchParams.get('sourceTable') ?? ''
  );
  const [sourceColumns, setSourceColumns] = useState<ColumnSchema[]>([]);

  // Target state
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    searchParams.get('targetClassId') ? Number(searchParams.get('targetClassId')) : null
  );
  const [classProperties, setClassProperties] = useState<ClassPropertyDTO[]>([]);

  // Mapping state - now uses config structure
  const [currentConfig, setCurrentConfig] = useState<FieldMappingConfigDTO | null>(null);
  const [mappingList, setMappingList] = useState<ColumnMappingItem[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);

  // Add mapping state
  const [adding, setAdding] = useState(false);
  const [newSourceCol, setNewSourceCol] = useState('');
  const [newTargetPropId, setNewTargetPropId] = useState<number | null>(null);
  const [newTransform, setNewTransform] = useState<TransformType>('DIRECT');

  // Delete mapping state - now tracks by sourceColumn since items don't have IDs
  const [deletingCol, setDeletingCol] = useState<string | null>(null);

  // Save success modal
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived mapped sets
  const mappedSourceCols = new Set(mappingList.map((m) => m.sourceColumn));
  const mappedTargetPropIds = new Set(mappingList.map((m) => m.targetPropertyId));

  // Unmapped options for add form
  const unmappedSources = sourceColumns.filter((c) => !mappedSourceCols.has(c.columnName));
  const unmappedTargets = classProperties.filter((p) => !mappedTargetPropIds.has(p.propertyId));

  const mappedCount = mappingList.length;
  const totalCount = sourceColumns.length;

  // Load data sources
  useEffect(() => {
    if (!currentOntologyId) return;
    listDataSources({ ontologyId: currentOntologyId })
      .then((res) => setAllDataSources(res.data ?? []))
      .catch(() => {});
  }, [currentOntologyId]);

  // Load classes
  useEffect(() => {
    if (!currentOntologyId) return;
    listClasses({ ontologyId: currentOntologyId })
      .then((res) => setClasses(res.data ?? []))
      .catch(() => {});
  }, [currentOntologyId]);

  // Load data source detail when selected
  useEffect(() => {
    if (!selectedDsId) {
      setCurrentDs(null);
      setTables([]);
      setSourceColumns([]);
      setSelectedTable('');
      return;
    }
    setLoading(true);
    getDataSource(selectedDsId)
      .then((res) => {
        setCurrentDs(res.data);
        const schemaTables = res.data.schemaJson?.tables ?? [];
        setTables(schemaTables);
        // If URL has sourceTable param and it exists in schema, use it
        const urlTable = searchParams.get('sourceTable');
        if (urlTable && schemaTables.some((t) => t.tableName === urlTable)) {
          const table = schemaTables.find((t) => t.tableName === urlTable);
          setSelectedTable(urlTable);
          setSourceColumns(table?.columns ?? []);
        } else if (schemaTables.length > 0 && !selectedTable) {
          setSelectedTable(schemaTables[0].tableName);
          setSourceColumns(schemaTables[0].columns ?? []);
        }
      })
      .catch((err) => {
        message.error(err instanceof Error ? err.message : 'Failed to load data source');
      })
      .finally(() => setLoading(false));
  }, [selectedDsId, searchParams]);

  // Update columns when table changes
  useEffect(() => {
    if (!selectedTable || tables.length === 0) {
      setSourceColumns([]);
      return;
    }
    const table = tables.find((t) => t.tableName === selectedTable);
    setSourceColumns(table?.columns ?? []);
  }, [selectedTable, tables]);

  // Load class properties when target class changes
  useEffect(() => {
    if (!selectedClassId) {
      setClassProperties([]);
      return;
    }
    listClassProperties(selectedClassId)
      .then((res) => setClassProperties(res.data ?? []))
      .catch(() => {});
  }, [selectedClassId]);

  // Load mappings - now uses config API
  const fetchMappings = useCallback(async () => {
    if (!selectedDsId || !selectedTable || !selectedClassId) {
      setCurrentConfig(null);
      setMappingList([]);
      return;
    }
    setLoadingMappings(true);
    try {
      const res = await listMappingConfigs({
        dataSourceId: selectedDsId,
        sourceTable: selectedTable,
        targetClassId: selectedClassId,
      });
      // Find the config for current table+class (should be 0 or 1 result)
      const configs = res.data ?? [];
      const config = configs.find(
        (c) => c.sourceTable === selectedTable && c.targetClassId === selectedClassId
      ) ?? null;
      setCurrentConfig(config);
      setMappingList(config?.mappings ?? []);
    } catch {
      setCurrentConfig(null);
      setMappingList([]);
    } finally {
      setLoadingMappings(false);
    }
  }, [selectedDsId, selectedTable, selectedClassId]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Auto-select first class if available
  useEffect(() => {
    if (classes.length > 0 && selectedClassId === null) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const handleConfirmAdd = () => {
    if (!newSourceCol || !newTargetPropId || !selectedDsId || !selectedClassId) return;
    const col = sourceColumns.find((c) => c.columnName === newSourceCol);
    const prop = classProperties.find((p) => p.propertyId === newTargetPropId);
    const newMapping: ColumnMappingItem = {
      sourceColumn: newSourceCol,
      sourceColumnType: col?.dataType,
      targetPropertyId: newTargetPropId,
      targetPropertyName: prop?.propertyName,
      targetPropertyType: prop?.dataType,
      transformType: newTransform,
    };
    setMappingList((prev) => [...prev, newMapping]);
    setAdding(false);
    setNewSourceCol('');
    setNewTargetPropId(null);
    setNewTransform('DIRECT');
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewSourceCol('');
    setNewTargetPropId(null);
    setNewTransform('DIRECT');
  };

  const handleConfirmDelete = async (mapping: ColumnMappingItem) => {
    // Remove from local state - actual deletion happens on save
    setMappingList((prev) => prev.filter((m) => m.sourceColumn !== mapping.sourceColumn));
    setDeletingCol(null);
  };

  const handleSave = async () => {
    if (!selectedDsId || !selectedClassId || !selectedTable) return;
    setSaving(true);
    try {
      // If no mappings left, delete the config (if it exists)
      if (mappingList.length === 0 && currentConfig) {
        await deleteMappingConfig(currentConfig.id);
        setCurrentConfig(null);
        setSaveOpen(true);
      } else if (mappingList.length > 0) {
        // Save using new config API
        const savedConfig = await saveMappingConfig({
          dataSourceId: selectedDsId,
          sourceTable: selectedTable,
          targetClassId: selectedClassId,
          mappings: mappingList.map((m) => ({
            sourceColumn: m.sourceColumn,
            sourceColumnType: m.sourceColumnType,
            targetPropertyId: m.targetPropertyId,
            transformType: m.transformType,
            customExpression: m.customExpression,
          })),
        });
        setCurrentConfig(savedConfig.data);
        setMappingList(savedConfig.data?.mappings ?? []);
        setSaveOpen(true);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<Typography.Text type="secondary" style={{ fontSize: 14 }}>/</Typography.Text>}
        items={[
          { title: <a onClick={() => navigate('/field-mapping-list')} style={{ cursor: 'pointer' }}>Field Mapping</a> },
          { title: <Typography.Text strong>{isViewMode ? 'View Mapping' : 'Configure Mapping'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12 }}>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/field-mapping-list')}>
          Back to List
        </Button>
        {isViewMode ? (
          <Button
            type="primary"
            icon={<Pencil size={16} />}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('mode');
              navigate(`/field-mapping?${params.toString()}`);
            }}
          >
            Edit Mapping
          </Button>
        ) : (
          <>
            <Button icon={<Zap size={16} />}>Auto Mapping</Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={saving}
              disabled={!selectedDsId || !selectedTable || !selectedClassId}
            >
              Save Mapping
            </Button>
          </>
        )}
      </div>
    );
  }, [setBreadcrumbs, setActions, saving, selectedDsId, selectedTable, selectedClassId, navigate, isViewMode, searchParams]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Content -- three-panel layout */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
        {/* -- Source Fields -- */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={20} color="#336791" />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Source Fields</Typography.Text>
            </div>
            {/* Data source selector */}
            <Select
              style={{ width: '100%' }}
              placeholder="Select data source"
              value={selectedDsId ?? undefined}
              onChange={(val) => {
                setSelectedDsId(val);
                setSelectedTable('');
                setSourceColumns([]);
              }}
              suffixIcon={<ChevronDown size={16} />}
              disabled={isViewMode}
              options={allDataSources.map((ds) => ({
                value: ds.id,
                label: `${ds.name} (${ds.subtype})`,
              }))}
            />
            {/* Table selector */}
            {tables.length > 0 && (
              <Select
                style={{ width: '100%' }}
                value={selectedTable || undefined}
                placeholder="Select table"
                onChange={(val) => setSelectedTable(val)}
                suffixIcon={<ChevronDown size={16} />}
                disabled={isViewMode}
                options={tables.map((t) => ({
                  value: t.tableName,
                  label: `${t.tableName}${t.rowCount != null ? ` (${t.rowCount} rows)` : ''}`,
                }))}
              />
            )}
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {sourceColumns.length === 0 && selectedDsId && (
              <Typography.Text type="secondary" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
                {tables.length === 0 ? 'No schema discovered. Run schema discovery first.' : 'Select a table to view columns.'}
              </Typography.Text>
            )}
            {sourceColumns.map((col) => (
              <FieldRow
                key={col.columnName}
                name={col.columnName}
                type={col.dataType}
                mapped={mappedSourceCols.has(col.columnName)}
                active={adding && newSourceCol === col.columnName}
                isPrimary={col.isPrimaryKey}
                connectorSide="right"
              />
            ))}
          </div>
        </div>

        {/* -- Field Mappings -- */}
        <div style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitMerge size={20} />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Field Mappings</Typography.Text>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {mappedCount} of {totalCount} fields mapped
            </Typography.Text>
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {loadingMappings && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin />
              </div>
            )}
            {!loadingMappings && mappingList.map((m) => {
              const mismatch = m.sourceColumnType && m.targetPropertyType
                ? hasTypeMismatch(m.sourceColumnType, m.targetPropertyType)
                : false;

              return !isViewMode && deletingCol === m.sourceColumn ? (
                /* -- Delete confirmation -- */
                <div
                  key={m.sourceColumn}
                  style={{
                    padding: 12, borderRadius: 8, border: '1px solid #ef4444',
                    background: 'rgba(239,68,68,0.08)', display: 'flex', flexDirection: 'column', gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.sourceColumn}</Typography.Text>
                    <ArrowRight size={14} color="#ef4444" />
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.targetPropertyName ?? `Property #${m.targetPropertyId}`}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} color="#a1a1aa" />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{transformLabels[m.transformType]}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <AlertTriangle size={12} color="#ef4444" />
                    <Typography.Text style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
                      Remove this mapping?
                    </Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button block onClick={() => setDeletingCol(null)}>Keep</Button>
                    <Button block danger type="primary" icon={<Trash2 size={16} />} onClick={() => handleConfirmDelete(m)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                /* -- Normal mapping row -- */
                <div
                  key={m.sourceColumn}
                  className="mapping-row"
                  style={{
                    padding: 12, borderRadius: 8, border: '1px solid var(--primary-color)',
                    background: 'rgba(139,92,246,0.06)', display: 'flex', flexDirection: 'column',
                    gap: 8, position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.sourceColumn}</Typography.Text>
                    <ArrowRight size={14} />
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.targetPropertyName ?? `Property #${m.targetPropertyId}`}</Typography.Text>
                    {!isViewMode && (
                      <div
                        onClick={() => setDeletingCol(m.sourceColumn)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 4, color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} color="#a1a1aa" />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{transformLabels[m.transformType]}</Typography.Text>
                  </div>
                  {/* Type mismatch warning */}
                  {mismatch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} color="#F59E0B" />
                      <Typography.Text style={{ fontSize: 11, color: '#F59E0B' }}>
                        Type mismatch: {m.sourceColumnType} → {m.targetPropertyType}
                      </Typography.Text>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Mapping -- form or button (hidden in view mode) */}
            {!isViewMode && adding ? (
              <div style={{
                padding: 12, borderRadius: 8, border: '1px solid var(--primary-color)',
                background: 'rgba(139,92,246,0.06)', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeftRight size={14} />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>New Mapping</Typography.Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Source Column</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newSourceCol || undefined}
                      placeholder="Select source column"
                      onChange={setNewSourceCol}
                      suffixIcon={<ChevronDown size={16} />}
                      options={unmappedSources.map((c) => ({
                        value: c.columnName,
                        label: `${c.columnName} (${c.dataType})`,
                      }))}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Target Property</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newTargetPropId ?? undefined}
                      placeholder="Select target property"
                      onChange={(val) => setNewTargetPropId(val)}
                      suffixIcon={<ChevronDown size={16} />}
                      options={unmappedTargets.map((p) => ({
                        value: p.propertyId,
                        label: `${p.propertyName} (${p.dataType})`,
                      }))}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Transform</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newTransform}
                      onChange={setNewTransform}
                      suffixIcon={<ChevronDown size={16} />}
                      options={transformOptions}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button block onClick={handleCancelAdd}>Cancel</Button>
                  <Button block type="primary" disabled={!newSourceCol || !newTargetPropId} icon={<Check size={16} />} onClick={handleConfirmAdd}>
                    Confirm
                  </Button>
                </div>
              </div>
            ) : !isViewMode ? (
              <div
                onClick={() => {
                  if (!selectedDsId || !selectedClassId) {
                    message.info('Select a data source and target class first');
                    return;
                  }
                  setAdding(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} color="#a1a1aa" />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>Add Mapping</Typography.Text>
              </div>
            ) : null}
          </div>
        </div>

        {/* -- Target Properties -- */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={20} />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Target Properties</Typography.Text>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Select target class"
              value={selectedClassId ?? undefined}
              onChange={(val) => setSelectedClassId(val)}
              suffixIcon={<ChevronDown size={16} />}
              disabled={isViewMode}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.name} (Class)`,
              }))}
            />
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {classProperties.length === 0 && selectedClassId && (
              <Typography.Text type="secondary" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
                No properties bound to this class.
              </Typography.Text>
            )}
            {classProperties.map((p) => (
              <FieldRow
                key={p.propertyId}
                name={p.propertyName}
                type={p.dataType}
                mapped={mappedTargetPropIds.has(p.propertyId)}
                active={adding && newTargetPropId === p.propertyId}
                connectorSide="left"
              />
            ))}
          </div>
        </div>
      </div>

      <SuccessModal
        open={saveOpen}
        title="Save Successful"
        description="The field mapping configuration has been saved successfully. Changes will take effect on the next sync."
        onClose={() => setSaveOpen(false)}
      />
    </>
  );
}
