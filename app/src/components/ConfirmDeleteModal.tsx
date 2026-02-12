import { useState } from 'react';
import { Modal, Typography, Button, Input, Flex } from 'antd';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = 'Delete Item?',
  description = 'This action cannot be undone. All related data will be permanently deleted.',
  confirmLabel,
  confirmName,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [input, setInput] = useState('');
  const canConfirm = !confirmName || input === confirmName;

  const handleClose = () => {
    setInput('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setInput('');
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
      centered
      styles={{ content: { background: '#111118', border: '1px solid #27273a', borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } }}
    >
      {/* Header */}
      <Flex vertical align="center" gap={16} style={{ padding: '16px 0' }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.13)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Trash2 size={28} color="#EF4444" />
        </div>
        <Typography.Text style={{ fontSize: 20, fontWeight: 600, textAlign: 'center' }}>
          {title}
        </Typography.Text>
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa', textAlign: 'center', lineHeight: 1.6, padding: '0 16px' }}>
          {description}
        </Typography.Text>
      </Flex>

      {/* Confirm input */}
      {confirmName && (
        <Flex vertical gap={8} style={{ padding: '0 0 24px' }}>
          <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>
            Type {confirmLabel ?? 'the name'} to confirm:
          </Typography.Text>
          <Input
            placeholder={`Enter ${confirmLabel ?? 'name'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ borderRadius: 8, background: '#0a0a0f', fontSize: 14 }}
          />
        </Flex>
      )}

      {/* Actions */}
      <Flex justify="center" gap={12} style={{ paddingBottom: 8 }}>
        <Button
          onClick={handleClose}
          style={{
            borderColor: '#27273a', color: '#f4f4f5',
            borderRadius: 10, height: 44, padding: '0 24px',
            fontWeight: 500, fontSize: 14,
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          disabled={!canConfirm}
          onClick={handleConfirm}
          style={{
            borderRadius: 10, height: 44, padding: '0 24px',
            fontWeight: 500, fontSize: 14,
          }}
        >
          Delete
        </Button>
      </Flex>
    </Modal>
  );
}
