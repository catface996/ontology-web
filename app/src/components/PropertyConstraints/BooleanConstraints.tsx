import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface BooleanConstraintsProps {
  defaultValue: boolean;
  onDefaultValueChange: (value: boolean) => void;
}

export default function BooleanConstraints({
  defaultValue,
  onDefaultValueChange,
}: BooleanConstraintsProps) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={500} mb={1}>
        Default Value
      </Typography>
      <ToggleButtonGroup
        value={defaultValue ? 'true' : 'false'}
        exclusive
        onChange={(_, value) => {
          if (value !== null) {
            onDefaultValueChange(value === 'true');
          }
        }}
        size="small"
      >
        <ToggleButton value="false" sx={{ px: 3 }}>
          False
        </ToggleButton>
        <ToggleButton value="true" sx={{ px: 3 }}>
          True
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
