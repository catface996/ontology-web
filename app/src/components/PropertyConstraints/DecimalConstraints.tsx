import { InputNumber, Flex, Typography } from 'antd';

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
    <Flex vertical gap={16}>
      <Flex gap={16}>
        <div style={{ flex: 1 }}>
          <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
            Precision
          </Typography.Text>
          <InputNumber
            style={{ width: '100%' }}
            value={precision}
            min={1}
            onChange={(val) => onPrecisionChange(val ?? 1)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
            Scale
          </Typography.Text>
          <InputNumber
            style={{ width: '100%' }}
            value={scale}
            min={0}
            onChange={(val) => onScaleChange(val ?? 0)}
          />
        </div>
      </Flex>
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
    </Flex>
  );
}
