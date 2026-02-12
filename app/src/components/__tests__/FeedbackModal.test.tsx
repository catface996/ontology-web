import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlertCircle } from 'lucide-react';
import FeedbackModal from '../FeedbackModal';
import type { FeedbackModalAction } from '../FeedbackModal';

describe('FeedbackModal', () => {
  const mockActions: FeedbackModalAction[] = [
    { label: 'Cancel', variant: 'outlined', onClick: vi.fn() },
    { label: 'Confirm', color: 'var(--primary-color)', hoverColor: '#7c3aed', onClick: vi.fn() },
  ];

  const defaultProps = {
    open: true,
    icon: AlertCircle,
    iconColor: 'var(--primary-color)',
    title: 'Test Title',
    description: 'Test description text',
    actions: mockActions,
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders title and description', () => {
      render(<FeedbackModal {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description text')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<FeedbackModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('renders all action buttons', () => {
      render(<FeedbackModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('renders a single action button', () => {
      const singleAction: FeedbackModalAction[] = [
        { label: 'OK', color: '#22C55E', onClick: vi.fn() },
      ];
      render(<FeedbackModal {...defaultProps} actions={singleAction} />);

      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('renders outlined button variant correctly', () => {
      render(<FeedbackModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toHaveClass('MuiButton-outlined');
    });

    it('renders contained button variant correctly', () => {
      render(<FeedbackModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('MuiButton-contained');
    });
  });

  describe('interactions', () => {
    it('calls action onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const actions: FeedbackModalAction[] = [
        { label: 'Cancel', variant: 'outlined', onClick: vi.fn() },
        { label: 'Confirm', color: 'var(--primary-color)', onClick: vi.fn() },
      ];
      render(<FeedbackModal {...defaultProps} actions={actions} />);

      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(actions[1].onClick).toHaveBeenCalledTimes(1);
      expect(actions[0].onClick).not.toHaveBeenCalled();
    });

    it('calls outlined action onClick when clicked', async () => {
      const user = userEvent.setup();
      const actions: FeedbackModalAction[] = [
        { label: 'Cancel', variant: 'outlined', onClick: vi.fn() },
        { label: 'Confirm', color: 'var(--primary-color)', onClick: vi.fn() },
      ];
      render(<FeedbackModal {...defaultProps} actions={actions} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(actions[0].onClick).toHaveBeenCalledTimes(1);
      expect(actions[1].onClick).not.toHaveBeenCalled();
    });
  });

  describe('props', () => {
    it('renders with different icon color', () => {
      render(<FeedbackModal {...defaultProps} iconColor="#EF4444" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders with various title/description combinations', () => {
      render(
        <FeedbackModal
          {...defaultProps}
          title="Custom Title"
          description="Custom description with more details."
        />,
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description with more details.')).toBeInTheDocument();
    });

    it('renders multiple contained actions (no variant specified defaults to contained)', () => {
      const actions: FeedbackModalAction[] = [
        { label: 'Retry', color: '#EF4444', onClick: vi.fn() },
        { label: 'Cancel', color: 'var(--primary-color)', onClick: vi.fn() },
      ];
      render(<FeedbackModal {...defaultProps} actions={actions} />);

      expect(screen.getByRole('button', { name: 'Retry' })).toHaveClass('MuiButton-contained');
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('MuiButton-contained');
    });
  });
});
