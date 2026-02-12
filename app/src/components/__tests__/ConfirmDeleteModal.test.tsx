import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default title and description', () => {
      render(<ConfirmDeleteModal {...defaultProps} />);

      expect(screen.getByText('Delete Item?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This action cannot be undone. All related data will be permanently deleted.',
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <ConfirmDeleteModal
          {...defaultProps}
          title="Delete Class?"
          description="This class will be removed from the ontology."
        />,
      );

      expect(screen.getByText('Delete Class?')).toBeInTheDocument();
      expect(
        screen.getByText('This class will be removed from the ontology.'),
      ).toBeInTheDocument();
    });

    it('renders Cancel and Delete buttons', () => {
      render(<ConfirmDeleteModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<ConfirmDeleteModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Delete Item?')).not.toBeInTheDocument();
    });

    it('renders confirmation input when confirmName is provided', () => {
      render(
        <ConfirmDeleteModal {...defaultProps} confirmName="MyClass" />,
      );

      expect(screen.getByPlaceholderText('Enter name...')).toBeInTheDocument();
      expect(screen.getByText('Type the name to confirm:')).toBeInTheDocument();
    });

    it('renders custom confirmLabel text', () => {
      render(
        <ConfirmDeleteModal
          {...defaultProps}
          confirmName="MyClass"
          confirmLabel="class name"
        />,
      );

      expect(screen.getByText('Type class name to confirm:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter class name...')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ConfirmDeleteModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Delete is clicked (no confirmName)', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables Delete button until confirmName is typed', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      const onConfirm = vi.fn();
      render(
        <ConfirmDeleteModal
          {...defaultProps}
          confirmName="MyClass"
          onConfirm={onConfirm}
        />,
      );

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeDisabled();

      // Clicking a disabled button should not trigger onConfirm
      await user.click(deleteButton);
      expect(onConfirm).not.toHaveBeenCalled();

      const input = screen.getByPlaceholderText('Enter name...');
      await user.type(input, 'MyClass');

      expect(deleteButton).toBeEnabled();
      await user.click(deleteButton);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not enable Delete button with partial confirmName match', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDeleteModal {...defaultProps} confirmName="MyClass" />,
      );

      const input = screen.getByPlaceholderText('Enter name...');
      await user.type(input, 'MyClas');

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    it('resets input when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <ConfirmDeleteModal
          {...defaultProps}
          confirmName="MyClass"
          onClose={onClose}
        />,
      );

      const input = screen.getByPlaceholderText('Enter name...');
      await user.type(input, 'test');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
