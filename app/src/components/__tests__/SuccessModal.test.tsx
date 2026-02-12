import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SuccessModal from '../SuccessModal';

describe('SuccessModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default title and description', () => {
      render(<SuccessModal {...defaultProps} />);

      expect(screen.getByText('Operation Successful')).toBeInTheDocument();
      expect(
        screen.getByText(
          'The operation has been completed successfully. Your changes have been saved.',
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <SuccessModal
          {...defaultProps}
          title="Class Created"
          description="The new class has been added to the ontology."
        />,
      );

      expect(screen.getByText('Class Created')).toBeInTheDocument();
      expect(
        screen.getByText('The new class has been added to the ontology.'),
      ).toBeInTheDocument();
    });

    it('renders Done button', () => {
      render(<SuccessModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<SuccessModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Operation Successful')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Done is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<SuccessModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Done' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
