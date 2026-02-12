import { InputNumber, Flex, Typography } from 'antd';

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
    <Flex gap={16}>
      <div style={{ flex: 1 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Min Length
        </Typography.Text>
        <InputNumber
          style={{ width: '100%' }}
          value={minLength}
          min={0}
          onChange={(val) => onMinLengthChange(val ?? 0)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Max Length
        </Typography.Text>
        <InputNumber
          style={{ width: '100%' }}
          value={maxLength}
          min={0}
          onChange={(val) => onMaxLengthChange(val ?? 0)}
        />
      </div>
    </Flex>
  );
}
