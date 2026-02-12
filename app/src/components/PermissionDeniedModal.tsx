import { ShieldX } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface PermissionDeniedModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function PermissionDeniedModal({
  open,
  title = 'Permission Denied',
  description = "You don't have permission to perform this action. Please contact your administrator for access.",
  onClose,
}: PermissionDeniedModalProps) {
  return (
    <FeedbackModal
      open={open}
      icon={ShieldX}
      iconColor="#F59E0B"
      title={title}
      description={description}
      onClose={onClose}
      actions={[
        { label: 'OK', color: 'var(--primary-color)', hoverColor: '#7c3aed', onClick: onClose },
      ]}
    />
  );
}
