import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  breadcrumb?: string;
}

export default function PagePlaceholder({ title, breadcrumb = 'Ontologies' }: PagePlaceholderProps) {
  return (
    <>
      <Box
        height={64}
        display="flex"
        alignItems="center"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            {breadcrumb}
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
      </Box>
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">{title} - Coming Soon</Typography>
      </Box>
    </>
  );
}
