import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { Breadcrumb, Typography, Button, Spin } from 'antd';
import {
  Calendar, Clock, User,
  FileText, Pencil, Download, Share2, Trash2,
  BarChart2, Users, PieChart, TrendingUp, Database,
  TriangleAlert, Zap, Globe,
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from '../components/MermaidBlock';
import EChartsBlock from '../components/EChartsBlock';
import { getReportDetail, deleteReport, type ReportDetailDTO } from '../services/coreService';

/* -- Extract plain text from React children (handles rehype-highlight spans) -- */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return '';
}

/* -- Icon map -- */
const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  BarChart2, Users, PieChart, TrendingUp, Database, TriangleAlert, Zap, Globe, FileText,
};

/* -- Status config -- */
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Active' },
  PENDING: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  DRAFT:   { color: '#a1a1aa', bg: 'rgba(161,161,170,0.12)', label: 'Draft' },
};

/* -- Page -- */
export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const confirmModal = useModal();
  const { setBreadcrumbs, setActions } = useHeader();
  const [report, setReport] = useState<ReportDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    setLoading(true);
    getReportDetail(Number(reportId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          setReport(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [reportId]);

  // Set header breadcrumbs and actions
  useEffect(() => {
    if (!report) return;
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Data</a> },
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Report Management</a> },
          { title: <Typography.Text strong>{report.title}</Typography.Text> },
        ]}
      />
    );
    const handleDelete = () => {
      confirmModal.confirm.delete({
        title: 'Delete Report?',
        description: 'This action cannot be undone. All data and configurations in this report will be permanently deleted.',
        confirmName: report.title,
        confirmLabel: 'the report name',
        onConfirm: async () => {
          await deleteReport(report.id);
          navigate('/report-management');
        },
      });
    };
    setActions(
      <div style={{ display: 'flex', gap: 8 }}>
        <Button icon={<Pencil size={16} />} onClick={() => navigate(`/report-management/${reportId}/edit`)}>Edit</Button>
        <Button icon={<Download size={16} />}>Export</Button>
        <Button icon={<Share2 size={16} />}>Share</Button>
        <Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>Delete</Button>
      </div>
    );
    return () => {
      setBreadcrumbs(null);
      setActions(null);
    };
  }, [setBreadcrumbs, setActions, report, reportId, navigate, confirmModal]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>Report not found</Typography.Text>
      </div>
    );
  }

  const Icon = iconMap[report.icon] || FileText;
  const st = statusConfig[report.status] || statusConfig.DRAFT;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return formatDate(dateStr);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* -- Content -- */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* -- Title Section -- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: `${report.iconColor}20`,
              }}
            >
              <Icon size={22} color={report.iconColor} />
            </div>
            <Typography.Text style={{ fontSize: 22, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              {report.title}
            </Typography.Text>
            <div style={{ padding: '4px 10px', borderRadius: 4, background: st.bg }}>
              <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>{st.label}</Typography.Text>
            </div>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            {report.description}
          </Typography.Text>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { icon: <Calendar size={14} color="#71717a" />, text: `Created: ${formatDate(report.createdAt)}` },
              { icon: <Clock size={14} color="#71717a" />, text: `Updated: ${formatRelativeTime(report.updatedAt)}` },
              { icon: <User size={14} color="#71717a" />, text: 'Author: Admin' },
            ].map((meta) => (
              <div key={meta.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {meta.icon}
                <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{meta.text}</Typography.Text>
              </div>
            ))}
          </div>
        </div>

        {/* -- Markdown Content -- */}
        <div
          style={{
            borderRadius: 12,
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <FileText size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Report Content</Typography.Text>
          </div>
          <div
            className="markdown-body"
            style={{
              padding: 24,
              fontSize: 14,
              lineHeight: 1.7,
              color: '#d4d4d8',
            }}
          >
            {report.content ? (
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre({ children, ...props }) {
                    const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
                    const cls = child?.props?.className || '';
                    if (cls.includes('language-mermaid')) {
                      return <MermaidBlock>{extractText(child.props.children)}</MermaidBlock>;
                    }
                    if (cls.includes('language-echarts')) {
                      return <EChartsBlock>{extractText(child.props.children)}</EChartsBlock>;
                    }
                    return <pre {...props}>{children}</pre>;
                  },
                }}
              >
                {report.content}
              </Markdown>
            ) : (
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                暂无内容
              </Typography.Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
