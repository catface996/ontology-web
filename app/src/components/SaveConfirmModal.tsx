import { Save } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface SaveConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SaveConfirmModal({
  open,
  title = 'Save Changes?',
  description = 'Are you sure you want to save these changes? This will update the current configuration.',
  onClose,
  onConfirm,
}: SaveConfirmModalProps) {
  return (
    <FeedbackModal
      open={open}
      icon={Save}
      iconColor="var(--primary-color)"
      title={title}
      description={description}
      onClose={onClose}
      actions={[
        { label: 'Cancel', variant: 'outlined', onClick: onClose },
        { label: 'Save', color: 'var(--primary-color)', hoverColor: '#7c3aed', onClick: onConfirm },
      ]}
    />
  );
}
