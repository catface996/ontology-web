import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SaveConfirmModal from '../SaveConfirmModal';

describe('SaveConfirmModal', () => {
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
      render(<SaveConfirmModal {...defaultProps} />);

      expect(screen.getByText('Save Changes?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Are you sure you want to save these changes? This will update the current configuration.',
        ),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <SaveConfirmModal
          {...defaultProps}
          title="Save Ontology?"
          description="The ontology will be updated with your changes."
        />,
      );

      expect(screen.getByText('Save Ontology?')).toBeInTheDocument();
      expect(
        screen.getByText('The ontology will be updated with your changes.'),
      ).toBeInTheDocument();
    });

    it('renders Cancel and Save buttons', () => {
      render(<SaveConfirmModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<SaveConfirmModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Save Changes?')).not.toBeInTheDocument();
    });

    it('Cancel button is outlined variant', () => {
      render(<SaveConfirmModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('MuiButton-outlined');
    });

    it('Save button is contained variant', () => {
      render(<SaveConfirmModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('MuiButton-contained');
    });
  });

  describe('interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<SaveConfirmModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Save is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<SaveConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirm when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      render(<SaveConfirmModal {...defaultProps} onClose={onClose} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
