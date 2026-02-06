import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

export default function MainLayout() {
  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Outlet />
      </Box>
    </Box>
  );
}
