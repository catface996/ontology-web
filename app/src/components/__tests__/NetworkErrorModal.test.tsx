import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import NetworkErrorModal from '../NetworkErrorModal';

describe('NetworkErrorModal', () => {
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
      render(<NetworkErrorModal {...defaultProps} />);

      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Unable to connect to the server. Please check your internet connection and try again.',
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <NetworkErrorModal
          {...defaultProps}
          title="Connection Lost"
          description="Server is unreachable. Retrying in 10 seconds."
        />,
      );

      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
      expect(
        screen.getByText('Server is unreachable. Retrying in 10 seconds.'),
      ).toBeInTheDocument();
    });

    it('renders Retry button', () => {
      render(<NetworkErrorModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<NetworkErrorModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Network Error')).not.toBeInTheDocument();
    });

    it('only renders a single button (Retry)', () => {
      render(<NetworkErrorModal {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('Retry');
    });
  });

  describe('interactions', () => {
    it('calls onRetry when Retry is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<NetworkErrorModal {...defaultProps} onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Retry is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onRetry = vi.fn();
      render(<NetworkErrorModal {...defaultProps} onClose={onClose} onRetry={onRetry} />);

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
