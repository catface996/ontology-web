import { Box, Typography, TextField, IconButton, Button } from '@mui/material';
import { Plus, X } from 'lucide-react';

interface EnumConstraintsProps {
  enumValues: string[];
  onEnumValuesChange: (values: string[]) => void;
}

export default function EnumConstraints({
  enumValues,
  onEnumValuesChange,
}: EnumConstraintsProps) {
  const handleAddValue = () => {
    onEnumValuesChange([...enumValues, '']);
  };

  const handleRemoveValue = (index: number) => {
    onEnumValuesChange(enumValues.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...enumValues];
    newValues[index] = value;
    onEnumValuesChange(newValues);
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={500} mb={1.5}>
        Enum Values
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {enumValues.map((value, index) => (
          <Box key={index} display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder={`Value ${index + 1}`}
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveValue(index)}
              disabled={enumValues.length <= 1}
            >
              <X size={16} />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="text"
          startIcon={<Plus size={14} />}
          onClick={handleAddValue}
          sx={{ alignSelf: 'flex-start', mt: 0.5 }}
        >
          Add Value
        </Button>
      </Box>
    </Box>
  );
}
