import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export function useResponsive() {
  const screens = useBreakpoint();

  // Mobile: < 768px (xs or sm only)
  const isMobile = !screens.md;
  // Tablet: 768px ~ 1023px (md but not lg)
  const isTablet = !!screens.md && !screens.lg;
  // Desktop: >= 1024px
  const isDesktop = !!screens.lg;

  return { isMobile, isTablet, isDesktop, screens };
}
