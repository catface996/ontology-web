import { WifiOff } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface NetworkErrorModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function NetworkErrorModal({
  open,
  title = 'Network Error',
  description = 'Unable to connect to the server. Please check your internet connection and try again.',
  onClose,
  onRetry,
}: NetworkErrorModalProps) {
  return (
    <FeedbackModal
      open={open}
      icon={WifiOff}
      iconColor="#EF4444"
      title={title}
      description={description}
      onClose={onClose}
      actions={[
        { label: 'Retry', color: 'var(--primary-color)', hoverColor: '#7c3aed', onClick: onRetry },
      ]}
    />
  );
}
