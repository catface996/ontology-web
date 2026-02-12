import { Select, Input, Flex, Typography } from 'antd';

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
    <Flex vertical gap={16}>
      <div>
        <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Date Format
        </Typography.Text>
        <Select
          style={{ width: '100%' }}
          value={dateFormat}
          onChange={(value) => onDateFormatChange(value)}
          options={dateFormats.map((format) => ({ label: format, value: format }))}
        />
      </div>
      <Flex gap={16}>
        <div style={{ flex: 1 }}>
          <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
            Min Date
          </Typography.Text>
          <Input
            type="date"
            value={minDate}
            onChange={(e) => onMinDateChange(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
            Max Date
          </Typography.Text>
          <Input
            type="date"
            value={maxDate}
            onChange={(e) => onMaxDateChange(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </Flex>
    </Flex>
  );
}
