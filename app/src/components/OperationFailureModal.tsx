import { X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface OperationFailureModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function OperationFailureModal({
  open,
  title = 'Operation Failed',
  description = 'An error occurred while processing your request. Please try again or contact support.',
  onClose,
  onRetry,
}: OperationFailureModalProps) {
  return (
    <FeedbackModal
      open={open}
      icon={X}
      iconColor="#EF4444"
      title={title}
      description={description}
      onClose={onClose}
      actions={[
        { label: 'Try Again', color: '#EF4444', hoverColor: '#DC2626', onClick: onRetry },
      ]}
    />
  );
}
