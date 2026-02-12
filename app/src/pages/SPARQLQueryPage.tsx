import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Breadcrumb, Typography, Input, Button, Card } from 'antd';
import {
  Search, ChevronRight, CirclePlay, Code,
  BookOpen, Zap, Trash2,
  Table, Download, File, Image,
  Share2,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import * as d3 from 'd3';
import CodeMirror from '@uiw/react-codemirror';
import { sql, StandardSQL } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { linter, type Diagnostic } from '@codemirror/lint';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

/* ── Custom dark theme matching the design ── */
const sparqlTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#111118',
    foreground: '#f4f4f5',
    caret: 'var(--primary-color)',
    selection: 'rgba(var(--primary-rgb), 0.19)',
    selectionMatch: 'rgba(var(--primary-rgb), 0.13)',
    lineHighlight: '#1a1a2440',
    gutterBackground: '#111118',
    gutterForeground: '#a1a1aa',
    gutterBorder: 'transparent',
    fontFamily: '"JetBrains Mono", monospace',
  },
  styles: [
    { tag: [t.keyword, t.operatorKeyword], color: 'var(--primary-color)' },
    { tag: [t.string], color: '#4ade80' },
    { tag: [t.number], color: '#fbbf24' },
    { tag: [t.comment], color: '#a1a1aa', fontStyle: 'italic' },
    { tag: [t.variableName, t.propertyName], color: '#c4b5fd' },
    { tag: [t.typeName, t.className], color: '#22d3ee' },
    { tag: [t.function(t.variableName)], color: '#f472b6' },
    { tag: [t.operator], color: '#a1a1aa' },
    { tag: [t.punctuation, t.bracket], color: '#a1a1aa' },
    { tag: [t.special(t.string)], color: '#4ade80' },
    { tag: [t.definition(t.variableName)], color: '#c4b5fd' },
  ],
});

/* ── CodeMirror base style overrides ── */
const editorBaseTheme = EditorView.theme({
  '&': { fontSize: '13px', height: '100%' },
  '.cm-scroller': { overflow: 'auto', fontFamily: '"JetBrains Mono", monospace' },
  '.cm-gutters': { borderRight: 'none', paddingRight: '8px' },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-content': { padding: '0' },
  '.cm-line': { padding: '0 0 0 16px' },
  '.cm-diagnostic': { fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' },
  '.cm-diagnostic-error': { borderLeftColor: '#ef4444' },
  '.cm-diagnostic-warning': { borderLeftColor: '#fbbf24' },
  '.cm-tooltip-lint': { background: '#1a1a24', border: '1px solid #27273a', borderRadius: '8px' },
  '.cm-lintPoint-error::after': { borderBottomColor: '#ef4444' },
  '.cm-lintPoint-warning::after': { borderBottomColor: '#fbbf24' },
});

/* ── SPARQL keywords for linting ── */
const SPARQL_KEYWORDS = new Set([
  'SELECT', 'CONSTRUCT', 'DESCRIBE', 'ASK', 'WHERE', 'FILTER',
  'OPTIONAL', 'UNION', 'ORDER', 'BY', 'LIMIT', 'OFFSET', 'DISTINCT',
  'REDUCED', 'FROM', 'NAMED', 'PREFIX', 'BASE', 'GRAPH', 'GROUP',
  'HAVING', 'VALUES', 'BIND', 'AS', 'INSERT', 'DELETE', 'LOAD',
  'CLEAR', 'DROP', 'CREATE', 'ADD', 'MOVE', 'COPY', 'WITH', 'USING',
  'SERVICE', 'SILENT', 'DATA', 'INTO', 'TO', 'NOT', 'IN', 'EXISTS',
  'MINUS', 'ASC', 'DESC', 'COUNT', 'SUM', 'MIN', 'MAX', 'AVG',
  'SAMPLE', 'GROUP_CONCAT', 'SEPARATOR', 'STR', 'LANG', 'LANGMATCHES',
  'DATATYPE', 'BOUND', 'IRI', 'URI', 'BNODE', 'RAND', 'ABS', 'CEIL',
  'FLOOR', 'ROUND', 'CONCAT', 'STRLEN', 'UCASE', 'LCASE', 'ENCODE_FOR_URI',
  'CONTAINS', 'STRSTARTS', 'STRENDS', 'STRBEFORE', 'STRAFTER', 'YEAR',
  'MONTH', 'DAY', 'HOURS', 'MINUTES', 'SECONDS', 'TIMEZONE', 'TZ',
  'NOW', 'UUID', 'STRUUID', 'MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512',
  'COALESCE', 'IF', 'REGEX', 'REPLACE', 'SUBSTR', 'ISIRI', 'ISURI',
  'ISBLANK', 'ISLITERAL', 'ISNUMERIC', 'SAMETERM', 'TRUE', 'FALSE',
]);

/* ── SPARQL syntax linter ── */
function sparqlLinter(view: EditorView): Diagnostic[] {
  const doc = view.state.doc.toString();
  const diagnostics: Diagnostic[] = [];

  // Check matching braces
  let braceDepth = 0;
  let lastOpenBrace = -1;
  for (let i = 0; i < doc.length; i++) {
    if (doc[i] === '{') { braceDepth++; lastOpenBrace = i; }
    if (doc[i] === '}') braceDepth--;
    if (braceDepth < 0) {
      diagnostics.push({
        from: i, to: i + 1,
        severity: 'error',
        message: 'Unmatched closing brace "}"',
      });
      braceDepth = 0;
    }
  }
  if (braceDepth > 0 && lastOpenBrace >= 0) {
    diagnostics.push({
      from: lastOpenBrace, to: lastOpenBrace + 1,
      severity: 'error',
      message: `Unmatched opening brace "{" — ${braceDepth} unclosed`,
    });
  }

  // Check PREFIX syntax:  PREFIX prefix: <uri>
  const prefixRegex = /PREFIX\s+(\S+)/gi;
  let prefixMatch;
  while ((prefixMatch = prefixRegex.exec(doc)) !== null) {
    const prefixName = prefixMatch[1];
    if (!prefixName.endsWith(':')) {
      const from = prefixMatch.index + prefixMatch[0].indexOf(prefixName);
      diagnostics.push({
        from,
        to: from + prefixName.length,
        severity: 'warning',
        message: `PREFIX name "${prefixName}" should end with ":"`,
      });
    }
  }

  // Check that PREFIX IRIs are enclosed in < >
  const prefixIriRegex = /PREFIX\s+\S+:\s+(\S+)/gi;
  let iriMatch;
  while ((iriMatch = prefixIriRegex.exec(doc)) !== null) {
    const iri = iriMatch[1];
    if (!iri.startsWith('<') || !iri.endsWith('>')) {
      const from = iriMatch.index + iriMatch[0].indexOf(iri);
      diagnostics.push({
        from,
        to: from + iri.length,
        severity: 'error',
        message: 'PREFIX IRI must be enclosed in angle brackets < >',
      });
    }
  }

  // Check for query form keyword (SELECT, CONSTRUCT, ASK, DESCRIBE)
  const stripped = doc.replace(/#[^\n]*/g, '').replace(/PREFIX\s+\S+:\s+<[^>]*>/gi, '');
  if (stripped.trim().length > 0) {
    const hasQueryForm = /\b(SELECT|CONSTRUCT|ASK|DESCRIBE|INSERT|DELETE)\b/i.test(stripped);
    if (!hasQueryForm) {
      diagnostics.push({
        from: 0, to: Math.min(doc.length, 1),
        severity: 'warning',
        message: 'Missing query form keyword (SELECT, CONSTRUCT, ASK, or DESCRIBE)',
      });
    }
  }

  // Check SELECT without WHERE
  if (/\bSELECT\b/i.test(doc) && !/\bWHERE\b/i.test(doc)) {
    const selectIdx = doc.search(/\bSELECT\b/i);
    diagnostics.push({
      from: selectIdx, to: selectIdx + 6,
      severity: 'warning',
      message: 'SELECT query typically requires a WHERE clause',
    });
  }

  // Check for unclosed angle brackets in IRIs
  const angleBrackets = doc.match(/<[^>\n]*(?:\n|$)/g);
  if (angleBrackets) {
    for (const ab of angleBrackets) {
      if (!ab.includes('>')) {
        const idx = doc.indexOf(ab);
        diagnostics.push({
          from: idx, to: idx + ab.length,
          severity: 'error',
          message: 'Unclosed IRI — missing closing ">"',
        });
      }
    }
  }

  // Check for period at end of triple patterns (basic check inside { })
  const whereBlocks = doc.matchAll(/\{([^}]*)\}/gs);
  for (const block of whereBlocks) {
    const content = block[1];
    const blockStart = block.index! + 1;
    const lines = content.split('\n');
    let lineOffset = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('FILTER') &&
        !trimmed.startsWith('OPTIONAL') &&
        !trimmed.startsWith('BIND') &&
        !trimmed.startsWith('SERVICE') &&
        !trimmed.startsWith('GRAPH') &&
        !trimmed.startsWith('VALUES') &&
        !trimmed.startsWith('MINUS') &&
        !trimmed.startsWith('{') &&
        !trimmed.startsWith('}') &&
        !trimmed.startsWith('UNION') &&
        !trimmed.endsWith('.') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}')
      ) {
        const from = blockStart + lineOffset + line.indexOf(trimmed);
        diagnostics.push({
          from,
          to: from + trimmed.length,
          severity: 'warning',
          message: 'Triple pattern should end with "." separator',
        });
      }
      lineOffset += line.length + 1;
    }
  }

  return diagnostics;
}

const sparqlLinterExtension = linter(sparqlLinter, { delay: 500 });

/* ── Mock data ── */
const defaultQuery =
  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ont: <http://ontology.io/schema#>

SELECT ?person ?name ?org
WHERE {
  ?person rdf:type ont:Person .
  ?person ont:name ?name .
  ?person ont:worksFor ?org .
}`;

const mockResults = [
  { person: 'ont:person_001', name: '"John Smith"', org: 'ont:org_acme' },
  { person: 'ont:person_002', name: '"Jane Doe"', org: 'ont:org_techstart' },
  { person: 'ont:person_003', name: '"Bob Wilson"', org: 'ont:org_acme' },
  { person: 'ont:person_004', name: '"Alice Chen"', org: 'ont:org_innovate' },
  { person: 'ont:person_005', name: '"David Lee"', org: 'ont:org_techstart' },
];

/* ── Sub-components ── */
function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
      }}
    >
      <Icon size={14} />
      <Typography.Text style={{ fontSize: 13 }}>{label}</Typography.Text>
    </div>
  );
}

/* ── Graph data derived from query results ── */
interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'org';
  color: string;
}
interface GraphLink {
  source: string;
  target: string;
  color: string;
}

const orgColors: Record<string, string> = {
  'ont:org_acme': '#22D3EE',
  'ont:org_techstart': '#F472B6',
  'ont:org_innovate': '#4ADE80',
};

function buildGraphData(results: typeof mockResults) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seen = new Set<string>();

  for (const row of results) {
    if (!seen.has(row.org)) {
      seen.add(row.org);
      const label = row.org.replace('ont:org_', '').replace(/^\w/, (c) => c.toUpperCase());
      nodes.push({ id: row.org, label, type: 'org', color: orgColors[row.org] || '#A78BFA' });
    }
    if (!seen.has(row.person)) {
      seen.add(row.person);
      const label = row.name.replace(/"/g, '').split(' ')[0];
      nodes.push({ id: row.person, label, type: 'person', color: '#A78BFA' });
    }
    links.push({ source: row.person, target: row.org, color: orgColors[row.org] || '#A78BFA' });
  }
  return { nodes, links };
}

/* ── SVG icon paths (from lucide) ── */
const ICON_USER = 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
const ICON_BUILDING = 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4';

/* ── Graph Canvas (D3 force layout) ── */
function GraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const { nodes, links } = buildGraphData(mockResults);
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);

    // Force simulation
    type SimNode = GraphNode & d3.SimulationNodeDatum;
    type SimLink = GraphLink & d3.SimulationLinkDatum<SimNode>;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = links.map((l) => ({ ...l }));

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.08))
      .force('y', d3.forceY(height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius((d: SimNode) => (d.type === 'org' ? 50 : 45)));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-linecap', 'round');

    // Node groups
    const node = g.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'grab')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }),
      );

    // Circle backgrounds
    node.append('circle')
      .attr('r', (d) => (d.type === 'org' ? 40 : 35))
      .attr('fill', '#111118')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.type === 'org' ? 3 : 2));

    // SVG icons
    node.append('g')
      .attr('transform', (d) => {
        const s = d.type === 'org' ? 0.9 : 0.75;
        const offset = d.type === 'org' ? -11 : -9;
        return `translate(${offset}, ${offset - 4}) scale(${s})`;
      })
      .append('path')
      .attr('d', (d) => (d.type === 'org' ? ICON_BUILDING : ICON_USER))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    // Labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.type === 'org' ? 20 : 18))
      .attr('fill', '#f4f4f5')
      .attr('font-size', (d) => (d.type === 'org' ? 11 : 10))
      .attr('font-weight', 500)
      .attr('font-family', 'Geist, sans-serif')
      .text((d) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, background: '#1a1a24', minHeight: 0, overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

/* ── Main component ── */
export default function SparqlQueryPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [query, setQuery] = useState(defaultQuery);
  const [resultView, setResultView] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a>Tools</a> },
          { title: <Typography.Text strong>SPARQL Query</Typography.Text> },
        ]}
      />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Input
          placeholder="Search queries..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
        />
        <Button type="primary" icon={<CirclePlay size={16} />}>
          Run Query
        </Button>
      </div>
    );
  }, [setBreadcrumbs, setActions]);

  const extensions = useMemo(
    () => [
      sql({ dialect: StandardSQL }),
      sparqlLinterExtension,
      editorBaseTheme,
      EditorView.lineWrapping,
    ],
    [],
  );

  const handleClear = useCallback(() => setQuery(''), []);
  const handleFormat = useCallback(() => {
    // Basic formatting: trim trailing spaces, normalise blank lines
    setQuery((prev) =>
      prev
        .split('\n')
        .map((l) => l.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n'),
    );
  }, []);

  return (
    <>
      {/* Main Content */}
      <div style={{ height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden', boxSizing: 'border-box' }}>
        {/* Editor Section */}
        <Card
          style={{ height: 320, minHeight: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
        >
          {/* Editor Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 48, flexShrink: 0, padding: '0 16px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Code size={18} color="var(--primary-color)" />
              <Typography.Text strong style={{ fontSize: 13 }}>Query Editor</Typography.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ToolButton icon={BookOpen} label="Templates" />
              <ToolButton icon={Zap} label="Format" onClick={handleFormat} />
              <ToolButton icon={Trash2} label="Clear" onClick={handleClear} />
            </div>
          </div>

          {/* CodeMirror Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CodeMirror
              value={query}
              onChange={setQuery}
              theme={sparqlTheme}
              extensions={extensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                indentOnInput: true,
                tabSize: 2,
              }}
              style={{ height: '100%', overflow: 'auto' }}
            />
          </div>
        </Card>

        {/* Result Section */}
        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
        >
          {/* Result Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 48, flexShrink: 0, padding: '0 16px',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {resultView === 'table' ? (
                <Table size={18} color="var(--primary-color)" />
              ) : (
                <Share2 size={18} color="var(--primary-color)" />
              )}
              <Typography.Text strong style={{ fontSize: 13 }}>
                {resultView === 'table' ? 'Query Results' : 'Graph Results'}
              </Typography.Text>
              <span
                style={{
                  background: '#22c55e20',
                  color: '#4ade80',
                  borderRadius: 100,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {resultView === 'table' ? '12 rows' : '8 nodes'}
              </span>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Executed in 0.042s
              </Typography.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                {([
                  { key: 'table' as const, Icon: Table },
                  { key: 'chart' as const, Icon: Share2 },
                ] as const).map(({ key, Icon }) => (
                  <div
                    key={key}
                    onClick={() => setResultView(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      cursor: 'pointer',
                      background: resultView === key ? 'rgba(255,255,255,0.08)' : 'transparent',
                    }}
                  >
                    <Icon size={14} color={resultView === key ? '#f4f4f5' : '#a1a1aa'} />
                  </div>
                ))}
              </div>
              {resultView === 'table' ? (
                <>
                  <ToolButton icon={Download} label="Export CSV" />
                  <ToolButton icon={Code} label="JSON" />
                </>
              ) : (
                <>
                  <ToolButton icon={Image} label="Export PNG" />
                  <ToolButton icon={File} label="SVG" />
                </>
              )}
            </div>
          </div>

          {/* Result Content */}
          {resultView === 'table' ? (
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              {/* Table Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {['?person', '?name', '?org'].map((col) => (
                  <div key={col} style={{ flex: 1 }}>
                    <Typography.Text
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--primary-color)',
                      }}
                    >
                      {col}
                    </Typography.Text>
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              {mockResults.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 16px',
                    background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Typography.Text style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#c4b5fd' }}>
                      {row.person}
                    </Typography.Text>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography.Text style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#4ade80' }}>
                      {row.name}
                    </Typography.Text>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography.Text style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#c4b5fd' }}>
                      {row.org}
                    </Typography.Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GraphCanvas />
          )}
        </Card>
      </div>
    </>
  );
}

