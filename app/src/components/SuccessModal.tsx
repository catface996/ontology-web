import { Check } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

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
    <FeedbackModal
      open={open}
      icon={Check}
      iconColor="#22C55E"
      title={title}
      description={description}
      onClose={onClose}
      actions={[
        { label: 'Done', color: '#22C55E', onClick: onClose },
      ]}
    />
  );
}
