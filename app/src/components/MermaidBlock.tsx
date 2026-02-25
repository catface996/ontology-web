import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#111118',
    primaryColor: '#6d28d9',
    primaryTextColor: '#d4d4d8',
    primaryBorderColor: '#4c1d95',
    lineColor: '#71717a',
    secondaryColor: '#1e1b4b',
    tertiaryColor: '#1a1a2e',
    fontFamily: 'JetBrains Mono, monospace',
  },
});

let mermaidIdCounter = 0;

export default function MermaidBlock({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    if (!children) return;

    let cancelled = false;

    (async () => {
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, children.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render Mermaid diagram');
          setSvg('');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [children]);

  if (error) {
    return (
      <div style={{
        padding: 16,
        borderRadius: 8,
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        color: '#f87171',
      }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Mermaid render error</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ padding: 16, color: '#71717a', fontSize: 13 }}>
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0',
        overflow: 'auto',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
