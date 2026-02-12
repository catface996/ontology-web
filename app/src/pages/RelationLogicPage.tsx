import { useState, useEffect } from 'react';
import { Button, Breadcrumb, Tag, Typography } from 'antd';
import {
  ChevronRight, Plus, MessageSquareText, Sparkles, ListChecks, Brain, ShieldCheck,
  CircleCheck, TriangleAlert, Hash, Repeat, GitMerge, Pencil, Trash2,
  Target, GitBranch, Boxes,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
interface Rule {
  name: string;
  badge: string;
  description: string;
  expression: string;
  dotColor: string;
  hasWarning?: boolean;
}

interface ParsedComponent {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface ValidationCheck {
  label: string;
  status: 'Passed' | 'Warning';
  icon: React.ReactNode;
}

/* ── Mock data ── */
const rules: Rule[] = [
  {
    name: 'Cardinality Constraint',
    badge: 'owl:maxCardinality',
    description: '"Each person can work for at most 3 organizations at the same time"',
    expression: 'Person ⊑ ≤3 hasEmployee.Organization',
    dotColor: '#4ade80',
  },
  {
    name: 'Inverse Relation',
    badge: 'owl:inverseOf',
    description: '"If organization A employs person B, then person B works for organization A"',
    expression: 'hasEmployee ≡ inverse(worksFor)',
    dotColor: '#4ade80',
  },
  {
    name: 'Transitivity Rule',
    badge: 'owl:TransitiveProperty',
    description: '"If A manages B and B manages C, then A indirectly manages C"',
    expression: 'hasEmployee ∈ TransitiveProperty',
    dotColor: '#fbbf24',
    hasWarning: true,
  },
  {
    name: 'Required Property',
    badge: 'owl:someValuesFrom',
    description: '"The employment relationship must have a start date property"',
    expression: '∃ startDate.xsd:date',
    dotColor: '#4ade80',
  },
];

const parsedComponents: ParsedComponent[] = [
  { icon: <Target size={14} />, label: 'Subject:', value: 'Person' },
  { icon: <GitBranch size={14} />, label: 'Relation:', value: 'hasEmployee' },
  { icon: <Boxes size={14} />, label: 'Object:', value: 'Organization' },
  { icon: <Hash size={14} />, label: 'Constraint:', value: 'max 3' },
];

const validationChecks: ValidationCheck[] = [
  { label: 'Syntax Valid', status: 'Passed', icon: <CircleCheck size={16} color="#4ade80" /> },
  { label: 'No Conflicts', status: 'Passed', icon: <CircleCheck size={16} color="#4ade80" /> },
  { label: 'Ontology Consistent', status: 'Passed', icon: <CircleCheck size={16} color="#4ade80" /> },
  { label: 'Performance Impact', status: 'Warning', icon: <TriangleAlert size={16} color="#fbbf24" /> },
];

const quickExamples = [
  { icon: <Hash size={14} />, label: 'Cardinality Constraint' },
  { icon: <Repeat size={14} />, label: 'Inverse Relation' },
  { icon: <GitMerge size={14} />, label: 'Transitivity' },
  { icon: <ShieldCheck size={14} />, label: 'Domain Validation' },
];

/* ── Page ── */
export default function RelationLogicPage() {
  const [nlText] = useState(
    'Each person can work for at most 3 organizations at the same time, and the employment relationship must have a start date.',
  );

  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb separator={<ChevronRight size={14} />} items={[{ title: <span style={{ color: '#a1a1aa', fontSize: 14 }}>Relations</span> }, { title: <Typography.Text strong>hasEmployee</Typography.Text> }, { title: <Typography.Text strong>Logic Rules</Typography.Text> }]} />
    );
    setActions(
      <>
        <Button>Cancel</Button>
        <Button type="primary" icon={<Plus size={16} />}>Add Rule</Button>
      </>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content — Two Columns */}
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
                <span style={{ fontSize: 14, lineHeight: 1.6, display: 'block', marginBottom: 12 }}>{nlText}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>128 characters</span>
                  <Button type="primary" icon={<Sparkles size={14} />}>
                    Analyze & Create Rule
                  </Button>
                </div>
              </div>

              {/* Quick Examples */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Quick Examples</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {quickExamples.map((ex) => (
                    <Tag key={ex.label} icon={<span style={{ color: 'var(--primary-color)', display: 'flex' }}>{ex.icon}</span>}>{ex.label}</Tag>
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
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>4 rules</span>
                </div>
              </div>

              {/* Rules List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rules.map((rule) => (
                  <div key={rule.name} style={{ backgroundColor: '#1a1a24', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Top */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: rule.dotColor }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{rule.name}</span>
                        </div>
                        <Tag color="purple">{rule.badge}</Tag>
                      </div>
                      {/* Description */}
                      <span style={{ fontSize: 13, fontStyle: 'italic', color: '#a1a1aa', lineHeight: 1.5 }}>
                        {rule.description}
                      </span>
                      {/* Bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>{rule.expression}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {rule.hasWarning && (
                            <div style={{ backgroundColor: '#33260D', borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 3, paddingBottom: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#fbbf24' }}>Disabled</span>
                            </div>
                          )}
                          <Button type="text" size="small" icon={<Pencil size={16} />} />
                          <Button type="text" size="small" icon={<Trash2 size={16} />} />
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

              {/* Confidence Score */}
              <div style={{ backgroundColor: '#15382A', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Confidence Score</span>
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' }}>94%</span>
              </div>

              {/* Parsed Components */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>Parsed Components</span>
                {parsedComponents.map((p) => (
                  <div key={p.label} style={{ backgroundColor: '#1a1a24', borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--primary-color)' }}>{p.icon}</span>
                    <span style={{ fontSize: 13, color: '#a1a1aa' }}>{p.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.value}</span>
                  </div>
                ))}
              </div>

              {/* Formal Logic Expression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>Formal Logic Expression</span>
                <div style={{ backgroundColor: '#0a0a0f', borderRadius: 8, border: '1px solid #27273a', padding: 14 }}>
                  <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)', lineHeight: 1.6 }}>
                    Person ⊑ ≤3 hasEmployee.Organization
                  </span>
                </div>
              </div>

              {/* OWL Representation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>OWL Representation</span>
                <div style={{ backgroundColor: '#0a0a0f', borderRadius: 8, border: '1px solid #27273a', padding: 14 }}>
                  <pre style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
{`<owl:Restriction>
  <owl:onProperty rdf:resource="#hasEmployee"/>
  <owl:maxCardinality>3</owl:maxCardinality>
</owl:Restriction>`}
                  </pre>
                </div>
              </div>
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

              {/* Validation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {validationChecks.map((v) => (
                  <div key={v.label} style={{ backgroundColor: '#1a1a24', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {v.icon}
                      <span style={{ fontSize: 13 }}>{v.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: v.status === 'Passed' ? '#4ade80' : '#fbbf24',
                      }}
                    >
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Warning Note */}
              <div style={{ backgroundColor: '#33260D', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TriangleAlert size={14} color="#fbbf24" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Performance Notice</span>
                </div>
                <span style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.5 }}>
                  Cardinality constraints may slow queries on large datasets with &gt;100k instances.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
