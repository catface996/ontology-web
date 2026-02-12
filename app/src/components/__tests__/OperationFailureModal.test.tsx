import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import OperationFailureModal from '../OperationFailureModal';

describe('OperationFailureModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onRetry: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default title and description', () => {
      render(<OperationFailureModal {...defaultProps} />);

      expect(screen.getByText('Operation Failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'An error occurred while processing your request. Please try again or contact support.',
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <OperationFailureModal
          {...defaultProps}
          title="Save Failed"
          description="Unable to save the ontology. Please check your data and try again."
        />,
      );

      expect(screen.getByText('Save Failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Unable to save the ontology. Please check your data and try again.',
        ),
      ).toBeInTheDocument();
    });

    it('renders Try Again button', () => {
      render(<OperationFailureModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<OperationFailureModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Operation Failed')).not.toBeInTheDocument();
    });

    it('only renders a single button (Try Again)', () => {
      render(<OperationFailureModal {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('Try Again');
    });
  });

  describe('interactions', () => {
    it('calls onRetry when Try Again is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<OperationFailureModal {...defaultProps} onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: 'Try Again' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Try Again is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onRetry = vi.fn();
      render(<OperationFailureModal {...defaultProps} onClose={onClose} onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: 'Try Again' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
