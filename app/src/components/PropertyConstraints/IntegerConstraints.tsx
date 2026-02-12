import { InputNumber, Flex, Typography } from 'antd';

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
    <Flex gap={16}>
      <div style={{ flex: 1 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Min Value
        </Typography.Text>
        <InputNumber
          style={{ width: '100%' }}
          value={minValue}
          onChange={(val) => onMinValueChange(val ?? 0)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Max Value
        </Typography.Text>
        <InputNumber
          style={{ width: '100%' }}
          value={maxValue}
          onChange={(val) => onMaxValueChange(val ?? 0)}
        />
      </div>
    </Flex>
  );
}
