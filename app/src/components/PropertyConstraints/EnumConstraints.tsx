import { Typography, Input, Button, Flex } from 'antd';
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
    <div>
      <Typography.Text style={{ fontWeight: 500, fontSize: 14, display: 'block', marginBottom: 12 }}>
        Enum Values
      </Typography.Text>
      <Flex vertical gap={8}>
        {enumValues.map((value, index) => (
          <Flex key={index} gap={8} align="center">
            <Input
              placeholder={`Value ${index + 1}`}
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              style={{ flex: 1 }}
            />
            <Button
              type="text"
              size="small"
              icon={<X size={14} />}
              onClick={() => handleRemoveValue(index)}
              disabled={enumValues.length <= 1}
            />
          </Flex>
        ))}
        <Button
          type="link"
          icon={<Plus size={14} />}
          onClick={handleAddValue}
          style={{ alignSelf: 'flex-start', marginTop: 4, paddingLeft: 0 }}
        >
          Add Value
        </Button>
      </Flex>
    </div>
  );
}
