import { Typography, Radio, Flex } from 'antd';

interface BooleanConstraintsProps {
  defaultValue: boolean;
  onDefaultValueChange: (value: boolean) => void;
}

export default function BooleanConstraints({
  defaultValue,
  onDefaultValueChange,
}: BooleanConstraintsProps) {
  return (
    <div>
      <Typography.Text style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 8 }}>
        Default Value
      </Typography.Text>
      <Flex gap={0}>
        <Radio.Group
          value={defaultValue ? 'true' : 'false'}
          onChange={(e) => onDefaultValueChange(e.target.value === 'true')}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: 'False', value: 'false' },
            { label: 'True', value: 'true' },
          ]}
        />
      </Flex>
    </div>
  );
}
