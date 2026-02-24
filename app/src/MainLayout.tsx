import { useState } from 'react';
import { Layout, Typography, Divider, Flex } from 'antd';
import { Bell, Globe, Check, LogOut } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { logout, getUser } from './utils/auth';
import Sidebar from './components/Sidebar';
import { HeaderProvider, useHeader } from './contexts/HeaderContext';

function GlobalHeader() {
  const navigate = useNavigate();
  const user = getUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const { breadcrumbs, actions } = useHeader();

  return (
    <>
      <Flex
        align="center"
        style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #27273a', flexShrink: 0 }}
      >
        {/* Left: Breadcrumbs */}
        <div style={{ flex: '0 0 auto' }}>
          {breadcrumbs}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: Page Actions + Bell + User */}
        <Flex align="center" gap={12}>
          {/* Page Actions */}
          {actions}

          {/* Divider between actions and global icons */}
          {actions && <div style={{ width: 1, height: 24, background: '#27273a', margin: '0 4px' }} />}

          {/* Bell Icon */}
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} color="#a1a1aa" />
          </div>

          {/* User Area */}
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary-color)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            onClick={() => setUserMenuOpen((prev) => !prev)}
          >
            <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
              {user?.nickname?.[0] || 'A'}
            </Typography.Text>
          </div>
        </Flex>
      </Flex>

      {/* User Menu Popover */}
      {userMenuOpen && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 24, zIndex: 1300,
              width: 248, background: '#1a1a24',
              border: '1px solid #27273a', borderRadius: 12, padding: '8px 0',
            }}
          >
            {/* User Info */}
            <Flex align="center" gap={12} style={{ padding: '12px 16px' }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary-color)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {user?.nickname?.[0] || 'A'}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                  {user?.nickname || 'Admin User'}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', display: 'block' }}>
                  {user?.username || 'admin@ontology.io'}
                </Typography.Text>
              </div>
            </Flex>
            <Divider style={{ margin: '0 8px' }} />

            {/* Language */}
            <div style={{ padding: '8px 16px' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Language</Typography.Text>
            </div>
            {(['English', '中文', '日本語'] as const).map((lang) => {
              const isActive = selectedLanguage === lang;
              return (
                <Flex
                  key={lang}
                  align="center"
                  gap={12}
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(var(--primary-rgb), 0.13)' : 'transparent',
                  }}
                >
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isActive && <Check size={14} color="var(--primary-color)" />}
                  </div>
                  <Globe size={14} color="#a1a1aa" />
                  <Typography.Text style={{ fontSize: 13 }}>{lang}</Typography.Text>
                </Flex>
              );
            })}
            <Divider style={{ margin: '0 8px' }} />

            {/* Logout */}
            <Flex
              align="center"
              gap={12}
              onClick={() => { void logout().then(() => navigate('/login')); }}
              style={{
                padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <LogOut size={14} color="#f87171" />
              <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#f87171' }}>Log out</Typography.Text>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
}

export default function MainLayout() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Sidebar />
      <Layout style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <HeaderProvider>
          <GlobalHeader />
          {/* Page Content */}
          <Layout.Content style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Layout.Content>
        </HeaderProvider>
      </Layout>
    </Layout>
  );
}
