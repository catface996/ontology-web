import { Box, TextField } from '@mui/material';

interface IntegerConstraintsProps {
  minValue: number;
  maxValue: number;
  onMinValueChange: (value: number) => void;
  onMaxValueChange: (value: number) => void;
}

export default function IntegerConstraints({
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
}: IntegerConstraintsProps) {
  return (
    <Box display="flex" gap={2}>
      <TextField
        fullWidth
        label="Min Value"
        type="number"
        value={minValue}
        onChange={(e) => onMinValueChange(Number(e.target.value))}
      />
      <TextField
        fullWidth
        label="Max Value"
        type="number"
        value={maxValue}
        onChange={(e) => onMaxValueChange(Number(e.target.value))}
      />
    </Box>
  );
}
