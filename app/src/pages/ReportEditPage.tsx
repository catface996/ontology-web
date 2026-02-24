import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Button, Input, Select, Spin, Flex } from 'antd';
import { Save, X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getReportDetail, updateReport, type ReportDetailDTO } from '../services/coreService';

export default function ReportEditPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState<ReportDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!reportId) return;
    setLoading(true);
    getReportDetail(Number(reportId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          const r = res.data;
          setReport(r);
          setTitle(r.title || '');
          setDescription(r.description || '');
          setStatus(r.status || 'DRAFT');
          setContent(r.content || '');
        }
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleSave = async () => {
    if (!reportId) return;
    setSaving(true);
    try {
      const res = await updateReport({
        id: Number(reportId),
        title,
        description,
        status,
        content,
        icon: report?.icon,
        iconColor: report?.iconColor,
      });
      if (res.code === 'SUCCESS') {
        navigate(`/report-management/${reportId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/report-management/${reportId}`);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Text type="secondary">Report not found</Typography.Text>
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
        <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Edit Report</Typography.Text>
        <Flex gap={8}>
          <Button icon={<X size={16} />} onClick={handleCancel}>Cancel</Button>
          <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={handleSave}>Save</Button>
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
            <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>Report Settings</Typography.Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <Typography.Text style={{ fontSize: 12, color: '#71717a', marginBottom: 4, display: 'block' }}>Title</Typography.Text>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ background: '#1a1a24', borderColor: '#27273a' }}
                />
              </div>
              <div>
                <Typography.Text style={{ fontSize: 12, color: '#71717a', marginBottom: 4, display: 'block' }}>Description</Typography.Text>
                <Input.TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
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
