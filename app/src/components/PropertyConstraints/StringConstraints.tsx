import { Box, TextField } from '@mui/material';

interface StringConstraintsProps {
  minLength: number;
  maxLength: number;
  onMinLengthChange: (value: number) => void;
  onMaxLengthChange: (value: number) => void;
}

export default function StringConstraints({
  minLength,
  maxLength,
  onMinLengthChange,
  onMaxLengthChange,
}: StringConstraintsProps) {
  return (
    <Box display="flex" gap={2}>
      <TextField
        fullWidth
        label="Min Length"
        type="number"
        value={minLength}
        onChange={(e) => onMinLengthChange(Number(e.target.value))}
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Max Length"
        type="number"
        value={maxLength}
        onChange={(e) => onMaxLengthChange(Number(e.target.value))}
        inputProps={{ min: 0 }}
      />
    </Box>
  );
}
