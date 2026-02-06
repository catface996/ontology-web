import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface DateConstraintsProps {
  dateFormat: string;
  minDate: string;
  maxDate: string;
  onDateFormatChange: (value: string) => void;
  onMinDateChange: (value: string) => void;
  onMaxDateChange: (value: string) => void;
}

const dateFormats = [
  'YYYY-MM-DD',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
  'DD-MM-YYYY',
  'MM-DD-YYYY',
];

export default function DateConstraints({
  dateFormat,
  minDate,
  maxDate,
  onDateFormatChange,
  onMinDateChange,
  onMaxDateChange,
}: DateConstraintsProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth>
        <InputLabel>Date Format</InputLabel>
        <Select
          label="Date Format"
          value={dateFormat}
          onChange={(e) => onDateFormatChange(e.target.value)}
        >
          {dateFormats.map((format) => (
            <MenuItem key={format} value={format}>
              {format}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          label="Min Date"
          type="date"
          value={minDate}
          onChange={(e) => onMinDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Max Date"
          type="date"
          value={maxDate}
          onChange={(e) => onMaxDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Box>
  );
}
