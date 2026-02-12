import { Breadcrumb, Typography, Flex } from 'antd';

interface PagePlaceholderProps {
  title: string;
  breadcrumb?: string;
}

export default function PagePlaceholder({ title, breadcrumb = 'Ontologies' }: PagePlaceholderProps) {
  return (
    <>
      <Flex
        align="center"
        style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #27273a' }}
      >
        <Breadcrumb
          separator=">"
          items={[
            { title: <a href="#">{breadcrumb}</a> },
            { title },
          ]}
        />
      </Flex>
      <Flex align="center" justify="center" style={{ flex: 1 }}>
        <Typography.Text type="secondary">{title} - Coming Soon</Typography.Text>
      </Flex>
    </>
  );
}
