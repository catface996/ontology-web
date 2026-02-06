import { useState } from 'react';
import { Dialog, Box, Typography, Button, TextField } from '@mui/material';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = 'Delete Item?',
  description = 'This action cannot be undone. All related data will be permanently deleted.',
  confirmLabel,
  confirmName,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [input, setInput] = useState('');
  const canConfirm = !confirmName || input === confirmName;

  const handleClose = () => {
    setInput('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setInput('');
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.85)' } } }}
      PaperProps={{ elevation: 0, sx: { borderRadius: 4, width: 440, maxWidth: '90vw', bgcolor: '#111118', border: '1px solid #27273a', backgroundImage: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } }}
    >
      {/* Header */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} px={4} pt={4} pb={3}>
        <Box
          width={56}
          height={56}
          borderRadius="50%"
          bgcolor="rgba(239, 68, 68, 0.13)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Trash2 size={28} color="#EF4444" />
        </Box>
        <Typography fontSize={20} fontWeight={600} textAlign="center">
          {title}
        </Typography>
        <Typography fontSize={14} color="text.secondary" textAlign="center" lineHeight={1.6} px={2}>
          {description}
        </Typography>
      </Box>

      {/* Confirm input */}
      {confirmName && (
        <Box px={4} pb={3} display="flex" flexDirection="column" gap={1}>
          <Typography fontSize={13} fontWeight={500} color="text.secondary">
            Type {confirmLabel ?? 'the name'} to confirm:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={`Enter ${confirmLabel ?? 'name'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#0a0a0f',
                fontSize: 14,
              },
            }}
          />
        </Box>
      )}

      {/* Actions */}
      <Box display="flex" justifyContent="center" gap={1.5} px={4} pb={4}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            borderRadius: 2.5,
            height: 44,
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 14,
            '&:hover': { borderColor: 'text.secondary' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canConfirm}
          onClick={handleConfirm}
          sx={{
            bgcolor: '#EF4444',
            '&:hover': { bgcolor: '#DC2626' },
            '&.Mui-disabled': { bgcolor: '#EF444440', color: '#ffffff60' },
            borderRadius: 2.5,
            height: 44,
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Delete
        </Button>
      </Box>
    </Dialog>
  );
}
