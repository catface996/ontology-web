import { Box, TextField } from '@mui/material';

interface DecimalConstraintsProps {
  precision: number;
  scale: number;
  minValue: number;
  maxValue: number;
  onPrecisionChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onMinValueChange: (value: number) => void;
  onMaxValueChange: (value: number) => void;
}

export default function DecimalConstraints({
  precision,
  scale,
  minValue,
  maxValue,
  onPrecisionChange,
  onScaleChange,
  onMinValueChange,
  onMaxValueChange,
}: DecimalConstraintsProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          label="Precision"
          type="number"
          value={precision}
          onChange={(e) => onPrecisionChange(Number(e.target.value))}
          inputProps={{ min: 1 }}
        />
        <TextField
          fullWidth
          label="Scale"
          type="number"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          inputProps={{ min: 0 }}
        />
      </Box>
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
    </Box>
  );
}
