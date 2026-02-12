import { Modal, Typography, Button, Flex } from 'antd';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function SuccessModal({
  open,
  title = 'Operation Successful',
  description = 'The operation has been completed successfully. Your changes have been saved.',
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={440}
      centered
      styles={{
        content: {
          background: '#111118',
          border: '1px solid #27273a',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        },
      }}
    >
      <Flex vertical align="center" gap={16} style={{ padding: '16px 0 8px' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.13)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={28} color="#22C55E" />
        </div>
        <Typography.Text style={{ fontSize: 20, fontWeight: 600, textAlign: 'center' }}>
          {title}
        </Typography.Text>
        <Typography.Text
          style={{ fontSize: 14, color: '#a1a1aa', textAlign: 'center', lineHeight: 1.6, padding: '0 16px' }}
        >
          {description}
        </Typography.Text>
      </Flex>
      <Flex justify="center" style={{ paddingBottom: 8 }}>
        <Button
          type="primary"
          onClick={onClose}
          style={{
            background: '#22C55E',
            borderColor: '#22C55E',
            borderRadius: 10,
            height: 44,
            padding: '0 24px',
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Done
        </Button>
      </Flex>
    </Modal>
  );
}
