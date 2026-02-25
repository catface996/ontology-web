import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Button, Input, Select, Spin, Flex } from 'antd';
import { Save, X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getReportTemplateDetail,
  createReportTemplate,
  updateReportTemplate,
  type ReportTemplateDetailDTO,
} from '../services/coreService';

export default function ReportTemplateEditPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { currentOntologyId } = useCurrentOntology();
  const isCreateMode = !templateId;

  const [template, setTemplate] = useState<ReportTemplateDetailDTO | null>(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isCreateMode) return;
    setLoading(true);
    getReportTemplateDetail(Number(templateId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          const t = res.data;
          setTemplate(t);
          setTitle(t.title || '');
          setDescription(t.description || '');
          setStatus(t.status || 'DRAFT');
          setContent(t.content || '');
        }
      })
      .finally(() => setLoading(false));
  }, [templateId, isCreateMode]);

  const handleSave = async () => {
    if (!title.trim() || (isCreateMode && !currentOntologyId)) return;
    setSaving(true);
    try {
      if (isCreateMode) {
        const res = await createReportTemplate({
          ontologyId: currentOntologyId!,
          title,
          description,
          status,
          content,
          icon: 'FileText',
          iconColor: '#8b5cf6',
        });
        if (res.code === 'SUCCESS' && res.data) {
          navigate(`/report-templates/${res.data.id}`);
        }
      } else {
        const res = await updateReportTemplate({
          id: Number(templateId),
          title,
          description,
          status,
          content,
          icon: template?.icon,
          iconColor: template?.iconColor,
        });
        if (res.code === 'SUCCESS') {
          navigate(`/report-templates/${templateId}`);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      navigate('/report-templates');
    } else {
      navigate(`/report-templates/${templateId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isCreateMode && !template) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Text type="secondary">Template not found</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          flexShrink: 0,
        }}
      >
        <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
          {isCreateMode ? 'New Template' : 'Edit Template'}
        </Typography.Text>
        <Flex gap={8}>
          <Button icon={<X size={16} />} onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            icon={<Save size={16} />}
            loading={saving}
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save
          </Button>
        </Flex>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
            <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Markdown Editor</Typography.Text>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <CodeMirror
              value={content}
              onChange={(val) => setContent(val)}
              extensions={[markdown()]}
              theme="dark"
              height="100%"
              style={{ height: '100%' }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
              }}
            />
          </div>
        </div>

        {/* Right: Config + Preview */}
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Config section */}
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Template Settings</Typography.Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <Typography.Text style={{ fontSize: 12, color: '#71717a', marginBottom: 4, display: 'block' }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </Typography.Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter template title"
                  style={{ background: '#1a1a24', borderColor: !title.trim() ? '#ef4444' : '#27273a' }}
                />
              </div>
              <div>
                <Typography.Text style={{ fontSize: 12, color: '#71717a', marginBottom: 4, display: 'block' }}>Description</Typography.Text>
                <Input.TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Enter template description"
                  style={{ background: '#1a1a24', borderColor: '#27273a' }}
                />
              </div>
              <div>
                <Typography.Text style={{ fontSize: 12, color: '#71717a', marginBottom: 4, display: 'block' }}>Status</Typography.Text>
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'DRAFT', label: 'Draft' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Preview section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
              <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Preview</Typography.Text>
            </div>
            <div
              className="markdown-body"
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 16,
                fontSize: 13,
                lineHeight: 1.6,
                color: '#d4d4d8',
              }}
            >
              {content ? (
                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {content}
                </Markdown>
              ) : (
                <Typography.Text type="secondary">Start typing to see preview...</Typography.Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
