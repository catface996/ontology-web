import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Input } from 'antd';
import { Trash2, AlertTriangle, CircleAlert, Building2 } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Page -- */
export default function RemoveDomainPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');

  const userName = 'John Doe';
  const domainName = 'Enterprise';
  const isConfirmed = confirmText === domainName;

  const { setBreadcrumbs } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'User Management' },
        { title: userName },
        { title: 'Remove Domain' },
      ]} />
    );
  }, [setBreadcrumbs, userName]);

  return (
    <>
      {/* Content -- centered */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        {/* Confirmation Modal Card */}
        <div
          style={{
            width: 520,
            borderRadius: 16,
            backgroundColor: '#0a0a0f',
            border: '1px solid #303030',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Warning Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#ef444420',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={32} color="#ef4444" />
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>Remove Domain Access</Typography.Text>
            <Typography.Text style={{ fontSize: 14, color: '#a1a1aa', textAlign: 'center' }}>
              Are you sure you want to remove {userName}&apos;s access to this domain?
            </Typography.Text>
          </div>

          {/* Domain Card */}
          <div
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              backgroundColor: '#1a1a24',
              border: '1px solid #303030',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: 'rgba(var(--primary-rgb), 0.13)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} color="var(--primary-color)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{domainName}</Typography.Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ backgroundColor: 'var(--primary-color)', borderRadius: 4, padding: '2px 8px' }}>
                  <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>Owner</Typography.Text>
                </span>
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>24 Classes &bull; 156 Relations</Typography.Text>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: '#ef444410',
              border: '1px solid #ef444440',
              display: 'flex',
              gap: 12,
            }}
          >
            <CircleAlert size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <Typography.Text style={{ fontSize: 13, color: '#ef4444', lineHeight: '1.5' }}>
              This action will immediately revoke access. The user will no longer be able to view or edit this domain.
            </Typography.Text>
          </div>

          {/* Confirm Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Typography.Text style={{ fontSize: 14 }}>
              Type &quot;{domainName}&quot; to confirm removal:
            </Typography.Text>
            <Input
              placeholder="Enter domain name..."
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{ backgroundColor: '#1a1a24', borderRadius: 8, fontSize: 14 }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <Button
              block
              size="large"
              onClick={() => navigate(`/user-management/${userId}`)}
              style={{
                border: '1px solid #303030',
                fontWeight: 500,
                padding: '10px 0',
              }}
            >
              Cancel
            </Button>
            <Button
              block
              size="large"
              type="primary"
              disabled={!isConfirmed}
              icon={<Trash2 size={16} />}
              danger
              style={{
                fontWeight: 500,
                padding: '10px 0',
              }}
            >
              Remove Access
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
