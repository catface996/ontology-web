import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Tag, Typography, Spin, App, Input, Modal } from 'antd';
import {
  ChevronRight, Plus, MessageSquareText, Sparkles, ListChecks, Brain, ShieldCheck,
  CircleCheck, CircleX, TriangleAlert, Hash, Repeat, GitMerge, Pencil, Trash2,
  Target, GitBranch, Boxes, Check, Loader2, Info,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import {
  getRelationLogic, getRelation, updateRelationLogic,
  analyzeRelationRule,
  type RelationLogicDTO, type RuleAnalysisResult, type NlpValidationResult,
} from '../services/coreService';

/* ── Types ── */
interface Rule {
  id: number;
  logicType: string;
  description: string;
  expression: string;
  hasWarning?: boolean;
}

type CheckStatus = 'passed' | 'warning' | 'failed';

interface ValidationCheckItem {
  label: string;
  status: CheckStatus;
}

/* ── Color mapping by rule type ── */
const ruleTypeColors: Record<string, string> = {
  CARDINALITY: '#fb923c',
  INVERSE: '#60a5fa',
  TRANSITIVE: '#a78bfa',
  SYMMETRIC: '#a78bfa',
  FUNCTIONAL: '#fbbf24',
  DOMAIN: '#4ade80',
  RANGE: '#4ade80',
  RESTRICTION: '#f472b6',
};

function getRuleColor(logicType: string): string {
  return ruleTypeColors[logicType.toUpperCase()] || '#4ade80';
}

function dtoToRule(dto: RelationLogicDTO): Rule {
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
    { label: 'Ontology Consistent', status: v.satisfiable },
    { label: 'Performance Impact', status: v.hierarchyConsistent },
  ];
}

function getOverallStatus(v: NlpValidationResult): 'all_passed' | 'has_warnings' | 'has_failures' {
  const statuses = [v.syntaxValid, v.noConflicts, v.satisfiable, v.hierarchyConsistent];
  if (statuses.some((s) => s === 'failed')) return 'has_failures';
  if (statuses.some((s) => s === 'warning')) return 'has_warnings';
  return 'all_passed';
}

/* ── Page ── */
export default function RelationLogicPage() {
  const { relationId } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [nlText, setNlText] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [relationName, setRelationName] = useState('hasEmployee');
  const [loading, setLoading] = useState(true);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RuleAnalysisResult | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editLogicType, setEditLogicType] = useState('');
  const [editExpression, setEditExpression] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const { setBreadcrumbs, setActions } = useHeader();

  // Quick Examples with dynamic relation name substitution
  const quickExamples = useMemo(() => [
    {
      icon: <Hash size={14} />,
      label: 'Cardinality Constraint',
      text: `Each person can have at most 3 ${relationName} relationships at the same time, and the relationship must have a start date.`,
    },
    {
      icon: <Repeat size={14} />,
      label: 'Inverse Relation',
      text: `The inverse of ${relationName} is isEmployeeOf — if X ${relationName} Y, then Y isEmployeeOf X.`,
    },
    {
      icon: <GitMerge size={14} />,
      label: 'Transitivity',
      text: `${relationName} is transitive — if A ${relationName} B and B ${relationName} C, then A ${relationName} C.`,
    },
    {
      icon: <ShieldCheck size={14} />,
      label: 'Domain Validation',
      text: `${relationName} has domain Organization and range Person — only organizations can have employees, and employees must be persons.`,
    },
  ], [relationName]);

  // Load relation logic and relation name from API
  useEffect(() => {
    if (!relationId) { setLoading(false); return; }
    (async () => {
      try {
        const [logicRes, relRes] = await Promise.allSettled([
          getRelationLogic(Number(relationId)),
          getRelation(Number(relationId)),
        ]);
        if (logicRes.status === 'fulfilled' && logicRes.value.data) {
          setRules(logicRes.value.data.map(dtoToRule));
        }
        if (relRes.status === 'fulfilled' && relRes.value.data) {
          setRelationName(relRes.value.data.name);
        }
      } catch {
        // failed to load relation logic
      } finally {
        setLoading(false);
      }
    })();
  }, [relationId]);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb separator={<ChevronRight size={14} />} items={[{ title: <a onClick={(e) => { e.preventDefault(); navigate('/relations'); }} style={{ color: '#a1a1aa', fontSize: 14 }}>Relations</a> }, { title: <Typography.Text strong>{relationName}</Typography.Text> }, { title: <Typography.Text strong>Logic Rules</Typography.Text> }]} />
    );
    setActions(
      <>
        <Button onClick={() => navigate('/relations')}>Cancel</Button>
        <Button type="primary" icon={<Plus size={16} />}>Add Rule</Button>
      </>
    );
  }, [setBreadcrumbs, setActions, navigate, relationName]);

  // Handle Analyze button click
  const handleAnalyze = async () => {
    if (!nlText.trim()) {
      message.warning('Please enter a natural language description first.');
      return;
    }
    if (!relationId) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await analyzeRelationRule({
        relationId: Number(relationId),
        naturalLanguageText: nlText.trim(),
      });
      setAnalysisResult(res.data);
    } catch {
      message.error('Failed to analyze rule. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle Confirm & Add Rule
  const handleConfirmRule = async () => {
    if (!analysisResult || !relationId) return;
    try {
      const existingLogics = rules.map((r) => ({
        relationId: Number(relationId),
        logicType: r.logicType,
        expression: r.expression,
      }));
      const newLogic = {
        relationId: Number(relationId),
        logicType: analysisResult.suggestedLogicType,
        expression: analysisResult.suggestedExpression,
      };
      const res = await updateRelationLogic({
        relationId: Number(relationId),
        logics: [...existingLogics, newLogic],
      });
      if (res.data) {
        setRules(res.data.map(dtoToRule));
      }
      setAnalysisResult(null);
      setNlText('');
      message.success('Rule added successfully.');
    } catch {
      message.error('Failed to save rule. Please try again.');
    }
  };

  // Handle Delete Rule
  const handleDeleteRule = (index: number) => {
    const rule = rules[index];
    modal.confirm({
      title: 'Delete Rule',
      content: `Are you sure you want to delete the rule "${rule.logicType}"? This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!relationId) return;
        try {
          const remaining = rules
            .filter((_, i) => i !== index)
            .map((r) => ({
              relationId: Number(relationId),
              logicType: r.logicType,
              expression: r.expression,
            }));
          const res = await updateRelationLogic({
            relationId: Number(relationId),
            logics: remaining,
          });
          if (res.data) {
            setRules(res.data.map(dtoToRule));
          } else {
            setRules((prev) => prev.filter((_, i) => i !== index));
          }
          message.success('Rule deleted.');
        } catch {
          message.error('Failed to delete rule.');
        }
      },
    });
  };

  // Handle Edit Rule — open modal
  const handleEditRule = (index: number) => {
    const rule = rules[index];
    setEditingIndex(index);
    setEditLogicType(rule.logicType);
    setEditExpression(rule.expression);
    setEditModalOpen(true);
  };

  // Handle Edit Save
  const handleEditSave = async () => {
    if (!relationId || editingIndex < 0) return;
    setEditSaving(true);
    try {
      const updatedLogics = rules.map((r, i) => ({
        relationId: Number(relationId),
        logicType: i === editingIndex ? editLogicType : r.logicType,
        expression: i === editingIndex ? editExpression : r.expression,
      }));
      const res = await updateRelationLogic({
        relationId: Number(relationId),
        logics: updatedLogics,
      });
      if (res.data) {
        setRules(res.data.map(dtoToRule));
      }
      setEditModalOpen(false);
      message.success('Rule updated.');
    } catch {
      message.error('Failed to update rule.');
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
          {/* NL Rule Builder Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MessageSquareText size={20} color="var(--primary-color)" />
                  <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Natural Language Rule Builder</span>
                </div>
                <Tag color="purple" icon={<Sparkles size={14} />}>AI Powered</Tag>
              </div>

              {/* Description */}
              <span style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.5 }}>
                Describe your logic rule in natural language, and AI will automatically parse and generate the corresponding formal logic expression.
              </span>

              {/* Input Area */}
              <div style={{ borderRadius: 10, border: '1px solid #27273a', backgroundColor: '#0a0a0f', padding: 16 }}>
                <Input.TextArea
                  value={nlText}
                  onChange={(e) => setNlText(e.target.value)}
                  placeholder="Describe your logic rule in natural language..."
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
                    Analyze & Create Rule
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

          {/* Active Logic Rules Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ListChecks size={20} color="var(--primary-color)" />
                <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Active Logic Rules</span>
                <div style={{ backgroundColor: '#1a1a24', borderRadius: 100, paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>{rules.length} rules</span>
                </div>
              </div>

              {/* Rules List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rules.length === 0 ? (
                  <span style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: '24px 0' }}>No logic rules defined for this relation</span>
                ) : rules.map((rule, index) => (
                  <div key={rule.id} style={{ backgroundColor: '#1a1a24', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Top */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getRuleColor(rule.logicType) }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{rule.logicType}</span>
                        </div>
                        <Tag color="purple">{rule.logicType}</Tag>
                      </div>
                      {/* Description */}
                      {rule.description && (
                        <span style={{ fontSize: 13, fontStyle: 'italic', color: '#a1a1aa', lineHeight: 1.5 }}>
                          {rule.description}
                        </span>
                      )}
                      {/* Bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>{rule.expression}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {rule.hasWarning && (
                            <div style={{ backgroundColor: '#33260D', borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 3, paddingBottom: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#fbbf24' }}>Disabled</span>
                            </div>
                          )}
                          <Button type="text" size="small" icon={<Pencil size={16} />} onClick={() => handleEditRule(index)} />
                          <Button type="text" size="small" icon={<Trash2 size={16} />} onClick={() => handleDeleteRule(index)} />
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
                    <Button type="primary" icon={<Check size={14} />} block onClick={handleConfirmRule}>
                      Confirm & Add Rule
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

          {/* Rule Validation Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={20} color="var(--primary-color)" />
                <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Rule Validation</span>
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
                        This rule is logically consistent and does not conflict with any existing relation definitions.
                      </span>
                    </div>
                  )}
                  {overallStatus === 'has_warnings' && (
                    <div style={{ backgroundColor: '#33260D', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <TriangleAlert size={14} color="#fbbf24" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Performance Notice</span>
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

      {/* Edit Rule Modal */}
      <Modal
        title="Edit Rule"
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
            <Input value={editLogicType} onChange={(e) => setEditLogicType(e.target.value)} placeholder="e.g. CARDINALITY, INVERSE" />
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
