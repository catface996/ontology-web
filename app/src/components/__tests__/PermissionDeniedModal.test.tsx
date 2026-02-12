import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PermissionDeniedModal from '../PermissionDeniedModal';

describe('PermissionDeniedModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default title and description', () => {
      render(<PermissionDeniedModal {...defaultProps} />);

      expect(screen.getByText('Permission Denied')).toBeInTheDocument();
      expect(
        screen.getByText(
          "You don't have permission to perform this action. Please contact your administrator for access.",
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <PermissionDeniedModal
          {...defaultProps}
          title="Access Restricted"
          description="You need admin role to modify this resource."
        />,
      );

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(
        screen.getByText('You need admin role to modify this resource.'),
      ).toBeInTheDocument();
    });

    it('renders OK button', () => {
      render(<PermissionDeniedModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<PermissionDeniedModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Permission Denied')).not.toBeInTheDocument();
    });

    it('only renders a single button (OK)', () => {
      render(<PermissionDeniedModal {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('OK');
    });
  });

  describe('interactions', () => {
    it('calls onClose when OK is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PermissionDeniedModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'OK' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
