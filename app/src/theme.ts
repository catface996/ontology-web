import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)]
    : [139, 92, 246];
}

export default function createTheme(primaryColor: string): ThemeConfig {
  const [r, g, b] = hexToRgb(primaryColor);
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

  return {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: primaryColor,
      borderRadius: 8,
      colorBgBase: '#0a0a0f',
      colorBgContainer: '#0d0d14',
      colorBorder: '#27273a',
      colorText: '#f4f4f5',
      colorTextSecondary: '#a1a1aa',
      colorTextTertiary: '#71717a',
      colorTextQuaternary: '#71717a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        headerBg: '#0d0d14',
        bodyBg: '#0a0a0f',
        siderBg: '#0d0d14',
        triggerBg: '#1e1e2a',
      },
      Card: {
        colorBgContainer: '#0d0d14',
      },
      Table: {
        headerBg: '#1e1e2a',
        rowHoverBg: rgba(0.08),
        headerColor: '#f4f4f5',
        borderColor: '#27273a',
        colorBgContainer: '#0d0d14',
        rowSelectedBg: rgba(0.12),
        rowSelectedHoverBg: rgba(0.16),
      },
      Button: {
        fontWeight: 500,
        primaryShadow: `0 4px 12px ${rgba(0.25)}`,
      },
      Menu: {
        darkItemBg: '#0d0d14',
        darkSubMenuItemBg: '#0d0d14',
        darkItemSelectedBg: rgba(0.12),
        darkItemHoverBg: rgba(0.08),
        itemBorderRadius: 8,
      },
      Input: {
        colorBgContainer: '#0d0d14',
      },
      Select: {
        colorBgContainer: '#0d0d14',
      },
      Modal: {
        contentBg: '#0d0d14',
        headerBg: '#0d0d14',
      },
      Tag: {
        borderRadiusSM: 8,
      },
      Pagination: {
        colorBgContainer: '#0d0d14',
      },
    },
  };
}
