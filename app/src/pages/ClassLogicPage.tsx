import { useState, useEffect } from 'react';
import { Button, Breadcrumb, Tag, Typography } from 'antd';
import {
  ChevronRight, Plus, MessageSquareText, Sparkles, ListChecks, Brain, ShieldCheck,
  CircleCheck, Info, EqualNot, Equal, Combine, Lock, Pencil, Trash2,
  Target, Boxes,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
interface Axiom {
  name: string;
  badge: string;
  description: string;
  expression: string;
  dotColor: string;
}

interface ParsedComponent {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface ValidationCheck {
  label: string;
  status: 'Passed';
}

/* ── Mock data ── */
const axioms: Axiom[] = [
  {
    name: 'Disjoint With Organization',
    badge: 'owl:disjointWith',
    description: '"Person and Organization are mutually exclusive — no individual can be both"',
    expression: 'Person ⊑ ¬Organization',
    dotColor: '#4ade80',
  },
  {
    name: 'Equivalent to Employee ⊔ Student',
    badge: 'owl:equivalentClass',
    description: '"A Person is defined as either an Employee or a Student (or both)"',
    expression: 'Person ≡ Employee ⊔ Student',
    dotColor: '#4ade80',
  },
  {
    name: 'Has Necessary Property: name',
    badge: 'owl:someValuesFrom',
    description: '"Every Person must have at least one name value"',
    expression: 'Person ⊑ ∃ name.xsd:string',
    dotColor: '#4ade80',
  },
];

const parsedComponents: ParsedComponent[] = [
  { icon: <Target size={14} />, label: 'Axiom Type:', value: 'Disjointness' },
  { icon: <Boxes size={14} />, label: 'Class A:', value: 'Person' },
  { icon: <Boxes size={14} />, label: 'Class B:', value: 'Organization' },
];

const validationChecks: ValidationCheck[] = [
  { label: 'Syntax Valid', status: 'Passed' },
  { label: 'No Conflicts', status: 'Passed' },
  { label: 'Satisfiability Check', status: 'Passed' },
  { label: 'Hierarchy Consistent', status: 'Passed' },
];

const quickExamples = [
  { icon: <EqualNot size={14} />, label: 'Disjoint Classes' },
  { icon: <Equal size={14} />, label: 'Equivalent Class' },
  { icon: <Combine size={14} />, label: 'Union / Intersection' },
  { icon: <Lock size={14} />, label: 'Closure Axiom' },
];

/* ── Page ── */
export default function ClassLogicPage() {
  const [nlText] = useState(
    'Person and Organization are mutually exclusive classes — no individual can be both a person and an organization at the same time.',
  );

  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={14} />}
        items={[
          { title: <span style={{ color: '#a1a1aa', fontSize: 14 }}>Classes</span> },
          { title: <Typography.Text strong style={{ fontSize: 14 }}>Person</Typography.Text> },
          { title: <Typography.Text strong style={{ fontSize: 14 }}>Logic Axioms</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        <Button>Cancel</Button>
        <Button type="primary" icon={<Plus size={16} />}>Add Axiom</Button>
      </>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content — Two Columns */}
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
                <span style={{ fontSize: 14, lineHeight: 1.6, display: 'block', marginBottom: 12 }}>{nlText}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#a1a1aa' }}>142 characters</span>
                  <Button type="primary" icon={<Sparkles size={14} />}>
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
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>3 axioms</span>
                </div>
              </div>

              {/* Axiom List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {axioms.map((ax) => (
                  <div key={ax.name} style={{ backgroundColor: '#1a1a24', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Top */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ax.dotColor }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{ax.name}</span>
                        </div>
                        <Tag color="purple">{ax.badge}</Tag>
                      </div>
                      {/* Description */}
                      <span style={{ fontSize: 13, fontStyle: 'italic', color: '#a1a1aa', lineHeight: 1.5 }}>
                        {ax.description}
                      </span>
                      {/* Bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>{ax.expression}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' }}>97%</span>
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
                    Person ⊑ ¬Organization
                  </span>
                </div>
              </div>

              {/* OWL Representation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>OWL Representation</span>
                <div style={{ backgroundColor: '#0a0a0f', borderRadius: 8, border: '1px solid #27273a', padding: 14 }}>
                  <pre style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
{`<owl:AllDisjointClasses>
  <owl:members rdf:parseType="Collection">
    <owl:Class rdf:about="#Person"/>
    <owl:Class rdf:about="#Organization"/>
  </owl:members>
</owl:AllDisjointClasses>`}
                  </pre>
                </div>
              </div>
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

              {/* Validation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {validationChecks.map((v) => (
                  <div key={v.label} style={{ backgroundColor: '#1a1a24', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CircleCheck size={16} color="#4ade80" />
                      <span style={{ fontSize: 13 }}>{v.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>{v.status}</span>
                  </div>
                ))}
              </div>

              {/* Info Note */}
              <div style={{ backgroundColor: '#172554', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Info size={14} color="#60a5fa" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>All Checks Passed</span>
                </div>
                <span style={{ fontSize: 12, color: '#60a5fa', lineHeight: 1.5 }}>
                  This axiom is logically consistent and does not conflict with any existing class definitions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
