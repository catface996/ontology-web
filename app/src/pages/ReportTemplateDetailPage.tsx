import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { Breadcrumb, Typography, Button, Spin, Flex } from 'antd';
import {
  Calendar, Clock, User,
  FileText, Pencil, Trash2, History,
  BarChart2, Users, PieChart, TrendingUp, Database,
  TriangleAlert, Zap, Globe,
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from '../components/MermaidBlock';
import EChartsBlock from '../components/EChartsBlock';
import {
  getReportTemplateDetail,
  deleteReportTemplate,
  listTemplateVersions,
  getTemplateVersionDetail,
  type ReportTemplateDetailDTO,
  type ReportTemplateVersionDTO,
  type ReportTemplateVersionDetailDTO,
} from '../services/coreService';

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
export default function ReportTemplateDetailPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const confirmModal = useModal();
  const { setBreadcrumbs, setActions } = useHeader();
  const [template, setTemplate] = useState<ReportTemplateDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [versions, setVersions] = useState<ReportTemplateVersionDTO[]>([]);
  const [viewingVersion, setViewingVersion] = useState<ReportTemplateVersionDetailDTO | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    getReportTemplateDetail(Number(templateId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          setTemplate(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    listTemplateVersions(Number(templateId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          setVersions(res.data);
        }
      });
  }, [templateId]);

  // Set header breadcrumbs and actions
  useEffect(() => {
    if (!template) return;
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Data</a> },
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-templates'); }}>Templates</a> },
          { title: <Typography.Text strong>{template.title}</Typography.Text> },
        ]}
      />
    );
    const handleDelete = () => {
      confirmModal.confirm.delete({
        title: 'Delete Template?',
        description: 'This action cannot be undone. The template and all its version history will be permanently deleted.',
        confirmName: template.title,
        confirmLabel: 'the template name',
        onConfirm: async () => {
          await deleteReportTemplate(template.id);
          navigate('/report-templates');
        },
      });
    };
    setActions(
      <div style={{ display: 'flex', gap: 8 }}>
        <Button icon={<Pencil size={16} />} onClick={() => navigate(`/report-templates/${templateId}/edit`)}>Edit</Button>
        <Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>Delete</Button>
      </div>
    );
    return () => {
      setBreadcrumbs(null);
      setActions(null);
    };
  }, [setBreadcrumbs, setActions, template, templateId, navigate, confirmModal]);

  const handleViewVersion = async (versionId: number) => {
    setVersionLoading(true);
    try {
      const res = await getTemplateVersionDetail(versionId);
      if (res.code === 'SUCCESS' && res.data) {
        setViewingVersion(res.data);
      }
    } finally {
      setVersionLoading(false);
    }
  };

  const handleViewCurrent = () => {
    setViewingVersion(null);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !template) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>Template not found</Typography.Text>
      </div>
    );
  }

  const Icon = iconMap[template.icon] || FileText;
  const st = statusConfig[template.status] || statusConfig.DRAFT;

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

  // Determine what content to show
  const displayContent = viewingVersion ? viewingVersion.content : template.content;
  const isViewingHistory = viewingVersion !== null;

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
                borderRadius: 10, background: `${template.iconColor || '#8b5cf6'}20`,
              }}
            >
              <Icon size={22} color={template.iconColor || '#8b5cf6'} />
            </div>
            <Typography.Text style={{ fontSize: 22, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              {template.title}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14, color: '#71717a' }}>
              v{template.majorVersion}.{template.minorVersion}
            </Typography.Text>
            <div style={{ padding: '4px 10px', borderRadius: 4, background: st.bg }}>
              <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>{st.label}</Typography.Text>
            </div>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            {template.description}
          </Typography.Text>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { icon: <Calendar size={14} color="#71717a" />, text: `Created: ${formatDate(template.createdAt)}` },
              { icon: <Clock size={14} color="#71717a" />, text: `Updated: ${formatRelativeTime(template.updatedAt)}` },
              { icon: <User size={14} color="#71717a" />, text: 'Author: Admin' },
            ].map((meta) => (
              <div key={meta.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {meta.icon}
                <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{meta.text}</Typography.Text>
              </div>
            ))}
          </div>
        </div>

        {/* -- Version banner (when viewing history) -- */}
        {isViewingHistory && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}
          >
            <Flex align="center" gap={8}>
              <History size={16} color="#fbbf24" />
              <Typography.Text style={{ fontSize: 13, color: '#fbbf24' }}>
                Viewing historical version v{viewingVersion.majorVersion}.{viewingVersion.minorVersion}
              </Typography.Text>
            </Flex>
            <a onClick={handleViewCurrent} style={{ fontSize: 13, cursor: 'pointer' }}>
              View current version
            </a>
          </div>
        )}

        {/* -- Markdown Content -- */}
        <div
          style={{
            borderRadius: 12,
            background: '#111118',
            border: `1px solid ${isViewingHistory ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.12)'}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <FileText size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>
              {isViewingHistory ? `Template Content (v${viewingVersion.majorVersion}.${viewingVersion.minorVersion})` : 'Template Content'}
            </Typography.Text>
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
            {versionLoading ? (
              <Spin />
            ) : displayContent ? (
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
                {displayContent}
              </Markdown>
            ) : (
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                暂无内容
              </Typography.Text>
            )}
          </div>
        </div>

        {/* -- Version History -- */}
        <div
          style={{
            borderRadius: 12,
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <History size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Version History</Typography.Text>
          </div>
          <div style={{ padding: 16 }}>
            {versions.length === 0 ? (
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>暂无版本历史</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {versions.map((v) => {
                  const isActive = viewingVersion?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleViewVersion(v.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
                        border: isActive ? '1px solid rgba(251,191,36,0.2)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Flex align="center" gap={12}>
                        <Typography.Text style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                          v{v.majorVersion}.{v.minorVersion}
                        </Typography.Text>
                        <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{v.title}</Typography.Text>
                      </Flex>
                      <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>
                        {formatDate(v.createdAt)}
                      </Typography.Text>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
