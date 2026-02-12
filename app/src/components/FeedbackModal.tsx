import { Modal, Typography, Button, Flex } from 'antd';
import type { LucideIcon } from 'lucide-react';

export interface FeedbackModalAction {
  label: string;
  color?: string;
  hoverColor?: string;
  variant?: 'contained' | 'outlined';
  onClick: () => void;
}

export interface FeedbackModalProps {
  open: boolean;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  actions: FeedbackModalAction[];
  onClose: () => void;
}

export default function FeedbackModal({
  open,
  icon: Icon,
  iconColor,
  title,
  description,
  actions,
  onClose,
}: FeedbackModalProps) {
  const iconBgColor = `${iconColor}20`;

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
      {/* Header */}
      <Flex vertical align="center" gap={16} style={{ padding: '16px 0 8px' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: iconBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={28} color={iconColor} />
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

      {/* Actions */}
      <Flex justify="center" gap={12} style={{ paddingBottom: 8 }}>
        {actions.map((action) =>
          action.variant === 'outlined' ? (
            <Button
              key={action.label}
              onClick={action.onClick}
              style={{
                borderColor: '#27273a',
                color: '#f4f4f5',
                borderRadius: 10,
                height: 44,
                padding: '0 24px',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {action.label}
            </Button>
          ) : (
            <Button
              key={action.label}
              type="primary"
              onClick={action.onClick}
              style={{
                background: action.color ?? 'var(--primary-color)',
                borderColor: action.color ?? 'var(--primary-color)',
                borderRadius: 10,
                height: 44,
                padding: '0 24px',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {action.label}
            </Button>
          ),
        )}
      </Flex>
    </Modal>
  );
}
