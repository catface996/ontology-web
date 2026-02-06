import { Dialog, Box, Typography, Button } from '@mui/material';
import { Check } from 'lucide-react';

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
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.85)' } } }}
      PaperProps={{ elevation: 0, sx: { borderRadius: 4, width: 440, maxWidth: '90vw', bgcolor: '#111118', border: '1px solid #27273a', backgroundImage: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4} pb={3}>
        <Box
          width={56}
          height={56}
          borderRadius="50%"
          bgcolor="rgba(34, 197, 94, 0.13)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Check size={28} color="#22C55E" />
        </Box>
        <Typography variant="h6" fontWeight={600} textAlign="center" fontSize={20}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" lineHeight={1.6} px={2}>
          {description}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" px={4} pb={4}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#22C55E',
            '&:hover': { bgcolor: '#16A34A' },
            borderRadius: 2.5,
            height: 44,
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Done
        </Button>
      </Box>
    </Dialog>
  );
}
