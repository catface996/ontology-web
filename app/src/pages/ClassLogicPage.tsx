import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Tag, Typography, Spin, App, Input, Modal } from 'antd';
import { useModal } from '../contexts/ModalContext';
import {
  ChevronRight, Plus, MessageSquareText, Sparkles, ListChecks, Brain, ShieldCheck,
  CircleCheck, CircleX, TriangleAlert, Info, EqualNot, Equal, Combine, Lock, Pencil, Trash2,
  Target, Boxes, Check, Loader2,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import {
  getClassLogic, getClass, updateClassLogic,
  analyzeClassAxiom,
  type ClassLogicDTO, type AxiomAnalysisResult, type NlpValidationResult,
} from '../services/coreService';

/* ── Types ── */
interface Axiom {
  id: number;
  logicType: string;
  description: string;
  expression: string;
}

type CheckStatus = 'passed' | 'warning' | 'failed';

interface ValidationCheckItem {
  label: string;
  status: CheckStatus;
}

/* ── Color mapping by axiom type ── */
const axiomTypeColors: Record<string, string> = {
  DISJOINT: '#4ade80',
  EQUIVALENT: '#60a5fa',
  UNION: '#a78bfa',
  INTERSECTION: '#a78bfa',
  RESTRICTION: '#fbbf24',
  CLOSURE: '#f472b6',
  CARDINALITY: '#fb923c',
};

function getAxiomColor(logicType: string): string {
  return axiomTypeColors[logicType.toUpperCase()] || '#4ade80';
}

function dtoToAxiom(dto: ClassLogicDTO): Axiom {
  return {
    id: dto.id,
    logicType: dto.logicType,
    description: '',
    expression: dto.expression,
  };
}

/* ── Validation helpers ── */
const statusConfig: Record<CheckStatus, { color: string; icon: React.ReactNode; label: string }> = {
  passed: { color: '#4ade80', icon: <CircleCheck size={16} color="#4ade80" />, label: 'Passed' },
  warning: { color: '#fbbf24', icon: <TriangleAlert size={16} color="#fbbf24" />, label: 'Warning' },
  failed: { color: '#f87171', icon: <CircleX size={16} color="#f87171" />, label: 'Failed' },
};

function validationToChecks(v: NlpValidationResult): ValidationCheckItem[] {
  return [
    { label: 'Syntax Valid', status: v.syntaxValid },
    { label: 'No Conflicts', status: v.noConflicts },
    { label: 'Satisfiability Check', status: v.satisfiable },
    { label: 'Hierarchy Consistent', status: v.hierarchyConsistent },
  ];
}

function getOverallStatus(v: NlpValidationResult): 'all_passed' | 'has_warnings' | 'has_failures' {
  const statuses = [v.syntaxValid, v.noConflicts, v.satisfiable, v.hierarchyConsistent];
  if (statuses.some((s) => s === 'failed')) return 'has_failures';
  if (statuses.some((s) => s === 'warning')) return 'has_warnings';
  return 'all_passed';
}

/* ── Page ── */
export default function ClassLogicPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [nlText, setNlText] = useState('');
  const [axioms, setAxioms] = useState<Axiom[]>([]);
  const [className, setClassName] = useState('Person');
  const [loading, setLoading] = useState(true);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AxiomAnalysisResult | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editLogicType, setEditLogicType] = useState('');
  const [editExpression, setEditExpression] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const confirmModal = useModal();
  const { setBreadcrumbs, setActions } = useHeader();

  // Quick Examples with dynamic class name substitution
  const quickExamples = useMemo(() => [
    {
      icon: <EqualNot size={14} />,
      label: 'Disjoint Classes',
      text: `${className} and Organization are mutually exclusive classes — no individual can be both a ${className.toLowerCase()} and an organization at the same time.`,
    },
    {
      icon: <Equal size={14} />,
      label: 'Equivalent Class',
      text: `${className} is equivalent to the union of Employee and Student — every ${className.toLowerCase()} is either an employee or a student.`,
    },
    {
      icon: <Combine size={14} />,
      label: 'Union / Intersection',
      text: `Working${className} is defined as the intersection of ${className} and Employee — an individual who is both a ${className.toLowerCase()} and an employee.`,
    },
    {
      icon: <Lock size={14} />,
      label: 'Closure Axiom',
      text: `${className} can only have gender values from the set {Male, Female} — no other gender values are permitted.`,
    },
  ], [className]);

  // Reload axioms from API
  const reloadAxioms = async () => {
    if (!classId) return;
    try {
      const res = await getClassLogic(Number(classId));
      if (res.data) setAxioms(res.data.map(dtoToAxiom));
    } catch { /* ignore */ }
  };

  // Load class logic and class name from API
  useEffect(() => {
    if (!classId) { setLoading(false); return; }
    (async () => {
      try {
        const [logicRes, classRes] = await Promise.allSettled([
          getClassLogic(Number(classId)),
          getClass(Number(classId)),
        ]);
        if (logicRes.status === 'fulfilled' && logicRes.value.data) {
          setAxioms(logicRes.value.data.map(dtoToAxiom));
        }
        if (classRes.status === 'fulfilled' && classRes.value.data) {
          setClassName(classRes.value.data.name);
        }
      } catch {
        // failed to load class logic
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={14} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/classes'); }} style={{ color: '#a1a1aa', fontSize: 14 }}>Classes</a> },
          { title: <Typography.Text strong style={{ fontSize: 14 }}>{className}</Typography.Text> },
          { title: <Typography.Text strong style={{ fontSize: 14 }}>Logic Axioms</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        <Button onClick={() => navigate('/classes')}>Cancel</Button>
        <Button type="primary" icon={<Plus size={16} />}>Add Axiom</Button>
      </>
    );
  }, [setBreadcrumbs, setActions, navigate, className]);

  // Handle Analyze button click
  const handleAnalyze = async () => {
    if (!nlText.trim()) {
      message.warning('Please enter a natural language description first.');
      return;
    }
    if (!classId) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await analyzeClassAxiom({
        classId: Number(classId),
        naturalLanguageText: nlText.trim(),
      });
      setAnalysisResult(res.data);
    } catch {
      message.error('Failed to analyze axiom. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle Confirm & Add Axiom
  const handleConfirmAxiom = async () => {
    if (!analysisResult || !classId) return;
    try {
      const existingLogics = axioms.map((ax) => ({
        classId: Number(classId),
        logicType: ax.logicType,
        expression: ax.expression,
      }));
      const newLogic = {
        classId: Number(classId),
        logicType: analysisResult.suggestedLogicType,
        expression: analysisResult.suggestedExpression,
      };
      const res = await updateClassLogic({
        classId: Number(classId),
        logics: [...existingLogics, newLogic],
      });
      if (res.data) {
        setAxioms(res.data.map(dtoToAxiom));
      }
      setAnalysisResult(null);
      setNlText('');
      message.success('Axiom added successfully.');
    } catch {
      message.error('Failed to save axiom. Please try again.');
    }
  };

  // Handle Delete Axiom
  const handleDeleteAxiom = (index: number) => {
    const ax = axioms[index];
    confirmModal.confirm.delete({
      title: 'Delete Axiom?',
      description: `This will permanently remove the "${ax.logicType}" axiom. This action cannot be undone.`,
      confirmName: ax.logicType,
      confirmLabel: 'axiom name',
      onConfirm: async () => {
        if (!classId) return;
        try {
          const remaining = axioms
            .filter((_, i) => i !== index)
            .map((a) => ({
              classId: Number(classId),
              logicType: a.logicType,
              expression: a.expression,
            }));
          const res = await updateClassLogic({
            classId: Number(classId),
            logics: remaining,
          });
          if (res.data) {
            setAxioms(res.data.map(dtoToAxiom));
          } else {
            setAxioms((prev) => prev.filter((_, i) => i !== index));
          }
          message.success('Axiom deleted.');
        } catch {
          message.error('Failed to delete axiom.');
        }
      },
    });
  };

  // Handle Edit Axiom — open modal
  const handleEditAxiom = (index: number) => {
    const ax = axioms[index];
    setEditingIndex(index);
    setEditLogicType(ax.logicType);
    setEditExpression(ax.expression);
    setEditModalOpen(true);
  };

  // Handle Edit Save
  const handleEditSave = async () => {
    if (!classId || editingIndex < 0) return;
    setEditSaving(true);
    try {
      const updatedLogics = axioms.map((ax, i) => ({
        classId: Number(classId),
        logicType: i === editingIndex ? editLogicType : ax.logicType,
        expression: i === editingIndex ? editExpression : ax.expression,
      }));
      const res = await updateClassLogic({
        classId: Number(classId),
        logics: updatedLogics,
      });
      if (res.data) {
        setAxioms(res.data.map(dtoToAxiom));
      }
      setEditModalOpen(false);
      message.success('Axiom updated.');
    } catch {
      message.error('Failed to update axiom.');
    } finally {
      setEditSaving(false);
    }
  };

  // Derived validation data from analysis result
  const validationChecks = analysisResult ? validationToChecks(analysisResult.validation) : null;
  const overallStatus = analysisResult ? getOverallStatus(analysisResult.validation) : null;

  return (
    <>
      {/* Content — Two Columns */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>
      ) : (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 24, padding: 24 }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
          {/* NL Axiom Builder Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MessageSquareText size={20} color="var(--primary-color)" />
                  <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Natural Language Axiom Builder</span>
                </div>
                <Tag color="purple" icon={<Sparkles size={14} />}>AI Powered</Tag>
              </div>

              {/* Description */}
              <span style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.5 }}>
                Describe class-level logic axioms in natural language. AI will parse them into OWL formal expressions.
              </span>

              {/* Input Area */}
              <div style={{ borderRadius: 10, border: '1px solid #27273a', backgroundColor: '#0a0a0f', padding: 16 }}>
                <Input.TextArea
                  value={nlText}
                  onChange={(e) => setNlText(e.target.value)}
                  placeholder="Describe class-level logic axioms in natural language..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  variant="borderless"
                  disabled={analyzing}
                  style={{ fontSize: 14, lineHeight: 1.6, padding: 0, marginBottom: 12, backgroundColor: 'transparent', color: 'inherit', resize: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>{nlText.length} characters</span>
                  <Button
                    type="primary"
                    icon={analyzing ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                    onClick={handleAnalyze}
                    loading={analyzing}
                    disabled={!nlText.trim()}
                  >
                    Analyze & Create Axiom
                  </Button>
                </div>
              </div>

              {/* Quick Examples */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Quick Examples</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {quickExamples.map((ex) => (
                    <Tag
                      key={ex.label}
                      icon={<span style={{ color: 'var(--primary-color)', display: 'flex' }}>{ex.icon}</span>}
                      style={{ cursor: 'pointer' }}
                      onClick={() => { setNlText(ex.text); setAnalysisResult(null); }}
                    >
                      {ex.label}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Class Axioms Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ListChecks size={20} color="var(--primary-color)" />
                <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Active Class Axioms</span>
                <div style={{ backgroundColor: '#1a1a24', borderRadius: 100, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>{axioms.length} axioms</span>
                </div>
              </div>

              {/* Axiom List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {axioms.length === 0 ? (
                  <span style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: '24px 0' }}>No axioms defined for this class</span>
                ) : axioms.map((ax, index) => (
                  <div key={ax.id} style={{ backgroundColor: '#1a1a24', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Top */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getAxiomColor(ax.logicType) }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{ax.logicType}</span>
                        </div>
                        <Tag color="purple">{ax.logicType}</Tag>
                      </div>
                      {/* Description */}
                      {ax.description && (
                        <span style={{ fontSize: 13, fontStyle: 'italic', color: '#a1a1aa', lineHeight: 1.5 }}>
                          {ax.description}
                        </span>
                      )}
                      {/* Bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>{ax.expression}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button type="text" size="small" icon={<Pencil size={16} />} onClick={() => handleEditAxiom(index)} />
                          <Button type="text" size="small" icon={<Trash2 size={16} />} onClick={() => handleDeleteAxiom(index)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
          {/* AI Interpretation Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Brain size={20} color="var(--primary-color)" />
                <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>AI Interpretation</span>
              </div>

              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0' }}>
                  <Spin size="large" />
                  <span style={{ fontSize: 13, color: '#a1a1aa' }}>Analyzing natural language input...</span>
                </div>
              ) : analysisResult ? (
                <>
                  {/* Confidence Score */}
                  <div style={{ backgroundColor: '#15382A', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Confidence Score</span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' }}>
                      {Math.round(analysisResult.confidence * 100)}%
                    </span>
                  </div>

                  {/* Parsed Components */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>Parsed Components</span>
                    {analysisResult.parsedComponents.map((p) => (
                      <div key={p.label} style={{ backgroundColor: '#1a1a24', borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--primary-color)' }}><Target size={14} /></span>
                        <span style={{ fontSize: 13, color: '#a1a1aa' }}>{p.label}:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Formal Logic Expression */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>Formal Logic Expression</span>
                    <div style={{ backgroundColor: '#0a0a0f', borderRadius: 8, border: '1px solid #27273a', padding: 14 }}>
                      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)', lineHeight: 1.6 }}>
                        {analysisResult.formalExpression}
                      </span>
                    </div>
                  </div>

                  {/* OWL Representation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>OWL Representation</span>
                    <div style={{ backgroundColor: '#0a0a0f', borderRadius: 8, border: '1px solid #27273a', padding: 14 }}>
                      <pre style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {analysisResult.owlExpression}
                      </pre>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  {overallStatus !== 'has_failures' && (
                    <Button type="primary" icon={<Check size={14} />} block onClick={handleConfirmAxiom}>
                      Confirm & Add Axiom
                    </Button>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
                  <Sparkles size={32} color="#27273a" />
                  <span style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', lineHeight: 1.5 }}>
                    Enter a natural language description and click "Analyze" to see AI interpretation.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Axiom Validation Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={20} color="var(--primary-color)" />
                <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Axiom Validation</span>
              </div>

              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0' }}>
                  <Spin />
                  <span style={{ fontSize: 13, color: '#a1a1aa' }}>Validating...</span>
                </div>
              ) : validationChecks ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {validationChecks.map((v) => {
                      const cfg = statusConfig[v.status];
                      return (
                        <div key={v.label} style={{ backgroundColor: '#1a1a24', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {cfg.icon}
                            <span style={{ fontSize: 13 }}>{v.label}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {overallStatus === 'all_passed' && (
                    <div style={{ backgroundColor: '#172554', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Info size={14} color="#60a5fa" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>All Checks Passed</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#60a5fa', lineHeight: 1.5 }}>
                        This axiom is logically consistent and does not conflict with any existing class definitions.
                      </span>
                    </div>
                  )}
                  {overallStatus === 'has_warnings' && (
                    <div style={{ backgroundColor: '#33260D', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <TriangleAlert size={14} color="#fbbf24" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Warnings Detected</span>
                      </div>
                      {analysisResult!.validation.warnings.map((w, i) => (
                        <span key={i} style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.5, display: 'block' }}>{w}</span>
                      ))}
                    </div>
                  )}
                  {overallStatus === 'has_failures' && (
                    <div style={{ backgroundColor: '#3B1318', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <CircleX size={14} color="#f87171" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>Validation Failed</span>
                      </div>
                      {analysisResult!.validation.errors.map((e, i) => (
                        <span key={i} style={{ fontSize: 12, color: '#f87171', lineHeight: 1.5, display: 'block' }}>{e}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
                  <ShieldCheck size={32} color="#27273a" />
                  <span style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', lineHeight: 1.5 }}>
                    Validation results will appear after analysis.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Edit Axiom Modal */}
      <Modal
        title="Edit Axiom"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        confirmLoading={editSaving}
        okText="Save"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Logic Type</Typography.Text>
            <Input value={editLogicType} onChange={(e) => setEditLogicType(e.target.value)} placeholder="e.g. DISJOINT, EQUIVALENT" />
          </div>
          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Expression</Typography.Text>
            <Input.TextArea
              value={editExpression}
              onChange={(e) => setEditExpression(e.target.value)}
              placeholder="Formal logic expression"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </div>
        </div>
      </Modal>

    </>
  );
}
