/**
 * Global modal management via React Context.
 *
 * Provides imperative methods (via `useModal()`) so any page or component can
 * trigger modals without owning the open/close state themselves.
 *
 * Usage:
 *   const modal = useModal();
 *   modal.confirm.save({ onConfirm: () => handleSave() });
 *   modal.confirm.delete({ confirmName: 'Enterprise', onConfirm: () => handleDelete() });
 *   modal.alert.success();
 *   modal.alert.error({ onRetry: () => retry() });
 *   modal.alert.networkError({ onRetry: () => retry() });
 *   modal.alert.permissionDenied();
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import SaveConfirmModal from '../components/SaveConfirmModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SuccessModal from '../components/SuccessModal';
import OperationFailureModal from '../components/OperationFailureModal';
import NetworkErrorModal from '../components/NetworkErrorModal';
import PermissionDeniedModal from '../components/PermissionDeniedModal';

// ---------------------------------------------------------------------------
// Option types for each modal
// ---------------------------------------------------------------------------

interface SaveConfirmOptions {
  title?: string;
  description?: string;
  onConfirm: () => void;
}

interface DeleteConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmName?: string;
  onConfirm: () => void;
}

interface SuccessOptions {
  title?: string;
  description?: string;
  onClose?: () => void;
}

interface ErrorOptions {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

interface NetworkErrorOptions {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

interface PermissionDeniedOptions {
  title?: string;
  description?: string;
  onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface ModalContextValue {
  confirm: {
    save: (options: SaveConfirmOptions) => void;
    delete: (options: DeleteConfirmOptions) => void;
  };
  alert: {
    success: (options?: SuccessOptions) => void;
    error: (options?: ErrorOptions) => void;
    networkError: (options?: NetworkErrorOptions) => void;
    permissionDenied: (options?: PermissionDeniedOptions) => void;
  };
}

const ModalContext = createContext<ModalContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type ModalType = 'save' | 'delete' | 'success' | 'error' | 'networkError' | 'permissionDenied';

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  // Store the latest options in a ref so the close handler always sees the
  // current callbacks without re-rendering when options change.
  const optionsRef = useRef<Record<string, unknown>>({});

  const open = useCallback((type: ModalType, options: Record<string, unknown> = {}) => {
    optionsRef.current = options;
    setActiveModal(type);
  }, []);

  const close = useCallback(() => {
    setActiveModal(null);
    optionsRef.current = {};
  }, []);

  // --- Imperative API ---

  const value = useMemo<ModalContextValue>(() => ({
    confirm: {
      save: (opts) => open('save', opts as unknown as Record<string, unknown>),
      delete: (opts) => open('delete', opts as unknown as Record<string, unknown>),
    },
    alert: {
      success: (opts) => open('success', (opts ?? {}) as Record<string, unknown>),
      error: (opts) => open('error', (opts ?? {}) as Record<string, unknown>),
      networkError: (opts) => open('networkError', (opts ?? {}) as Record<string, unknown>),
      permissionDenied: (opts) => open('permissionDenied', (opts ?? {}) as Record<string, unknown>),
    },
  }), [open]);

  // --- Read current options ---
  const opts = optionsRef.current;

  const handleClose = useCallback(() => {
    const cb = optionsRef.current.onClose as (() => void) | undefined;
    cb?.();
    close();
  }, [close]);

  const handleConfirm = useCallback(() => {
    const cb = optionsRef.current.onConfirm as (() => void) | undefined;
    cb?.();
    close();
  }, [close]);

  const handleRetry = useCallback(() => {
    const cb = optionsRef.current.onRetry as (() => void) | undefined;
    cb?.();
    close();
  }, [close]);

  return (
    <ModalContext.Provider value={value}>
      {children}

      <SaveConfirmModal
        open={activeModal === 'save'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        onClose={close}
        onConfirm={handleConfirm}
      />

      <ConfirmDeleteModal
        open={activeModal === 'delete'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        confirmLabel={opts.confirmLabel as string | undefined}
        confirmName={opts.confirmName as string | undefined}
        onClose={close}
        onConfirm={handleConfirm}
      />

      <SuccessModal
        open={activeModal === 'success'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        onClose={handleClose}
      />

      <OperationFailureModal
        open={activeModal === 'error'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        onClose={close}
        onRetry={handleRetry}
      />

      <NetworkErrorModal
        open={activeModal === 'networkError'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        onClose={close}
        onRetry={handleRetry}
      />

      <PermissionDeniedModal
        open={activeModal === 'permissionDenied'}
        title={opts.title as string | undefined}
        description={opts.description as string | undefined}
        onClose={handleClose}
      />
    </ModalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal() must be used within <ModalProvider>');
  }
  return ctx;
}

/** Shortcut: returns only the confirm methods */
export function useConfirmDialog() {
  return useModal().confirm;
}

/** Shortcut: returns only the alert methods */
export function useAlert() {
  return useModal().alert;
}
