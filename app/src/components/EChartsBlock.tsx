import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

const DARK_THEME = {
  backgroundColor: 'transparent',
  textStyle: { color: '#d4d4d8', fontFamily: 'JetBrains Mono, monospace' },
  title: { textStyle: { color: '#e4e4e7', fontSize: 14, fontWeight: 600 } },
  legend: { textStyle: { color: '#a1a1aa' } },
  tooltip: {
    backgroundColor: '#1e1e2e',
    borderColor: 'rgba(255,255,255,0.12)',
    textStyle: { color: '#d4d4d8' },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#3f3f46' } },
    axisLabel: { color: '#a1a1aa' },
    splitLine: { lineStyle: { color: '#27272a' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#3f3f46' } },
    axisLabel: { color: '#a1a1aa' },
    splitLine: { lineStyle: { color: '#27272a' } },
  },
};

const COLOR_PALETTE = ['#8b5cf6', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function EChartsBlock({ children }: { children: string }) {
  const { option, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(children.trim());

      // Apply dark theme defaults
      if (!parsed.backgroundColor) parsed.backgroundColor = DARK_THEME.backgroundColor;
      if (!parsed.textStyle) parsed.textStyle = DARK_THEME.textStyle;
      if (!parsed.color) parsed.color = COLOR_PALETTE;

      // Apply title style
      if (parsed.title) {
        if (Array.isArray(parsed.title)) {
          parsed.title.forEach((t: Record<string, unknown>) => {
            t.textStyle = { ...DARK_THEME.title.textStyle, ...(t.textStyle as object || {}) };
          });
        } else {
          parsed.title.textStyle = { ...DARK_THEME.title.textStyle, ...(parsed.title.textStyle || {}) };
        }
      }

      // Apply legend style
      if (parsed.legend && !parsed.legend.textStyle) {
        parsed.legend.textStyle = DARK_THEME.legend.textStyle;
      }

      // Apply tooltip style
      if (!parsed.tooltip) parsed.tooltip = {};
      parsed.tooltip = { ...DARK_THEME.tooltip, ...parsed.tooltip };

      // Apply axis styles
      const applyAxisStyle = (axis: Record<string, unknown> | Record<string, unknown>[] | undefined, defaults: typeof DARK_THEME.categoryAxis) => {
        if (!axis) return;
        const axes = Array.isArray(axis) ? axis : [axis];
        axes.forEach((a) => {
          if (!a.axisLine) a.axisLine = {};
          if (!a.axisLabel) a.axisLabel = {};
          if (!a.splitLine) a.splitLine = {};
          (a.axisLine as Record<string, unknown>).lineStyle = { ...defaults.axisLine.lineStyle, ...((a.axisLine as Record<string, unknown>).lineStyle as object || {}) };
          (a.axisLabel as Record<string, unknown>).color = (a.axisLabel as Record<string, unknown>).color || defaults.axisLabel.color;
          (a.splitLine as Record<string, unknown>).lineStyle = { ...defaults.splitLine.lineStyle, ...((a.splitLine as Record<string, unknown>).lineStyle as object || {}) };
        });
      };

      applyAxisStyle(parsed.xAxis, DARK_THEME.categoryAxis);
      applyAxisStyle(parsed.yAxis, DARK_THEME.valueAxis);

      // Apply label styles to all series for dark background readability
      if (parsed.series) {
        const seriesList = Array.isArray(parsed.series) ? parsed.series : [parsed.series];
        seriesList.forEach((s: Record<string, unknown>) => {
          if (!s.label) s.label = {};
          const label = s.label as Record<string, unknown>;
          if (!label.color) label.color = '#e4e4e7';
          if (label.borderColor === undefined) label.borderColor = 'transparent';
          if (label.textBorderColor === undefined) label.textBorderColor = 'transparent';
          if (label.textBorderWidth === undefined) label.textBorderWidth = 0;
          if (!label.fontFamily) label.fontFamily = 'JetBrains Mono, monospace';
        });
      }

      return { option: parsed, error: '' };
    } catch (err) {
      return { option: null, error: err instanceof Error ? err.message : 'Invalid JSON' };
    }
  }, [children]);

  if (error || !option) {
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
        <div style={{ marginBottom: 8, fontWeight: 600 }}>ECharts render error</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <ReactECharts
        option={option}
        style={{ height: option._height || 400, width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
