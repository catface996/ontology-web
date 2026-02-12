import { useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import createTheme from './theme';
import { ThemeColorProvider, useThemeColor } from './contexts/ThemeColorContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DomainSelection from './DomainSelection';
import MainLayout from './MainLayout';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import ClassesPage from './pages/ClassesPage';
import ClassEditorPage from './pages/ClassEditorPage';
import RelationsPage from './pages/RelationsPage';
import RelationEditorPage from './pages/RelationEditorPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyEditorPage from './pages/PropertyEditorPage';
import InstancesPage from './pages/InstancesPage';
import InstanceTopologyPage from './pages/InstanceTopologyPage';
import InstanceEditorPage from './pages/InstanceEditorPage';
import SparqlQueryPage from './pages/SparqlQueryPage';
import ImportExportPage from './pages/ImportExportPage';
import ReasoningPage from './pages/ReasoningPage';
import AgentChatPage from './pages/AgentChatPage';
import TaskHistoryPage from './pages/TaskHistoryPage';
import DataSourcesPage from './pages/DataSourcesPage';
import AddConnectionPage from './pages/AddConnectionPage';
import ConnectorsPage from './pages/ConnectorsPage';
import FieldMappingPage from './pages/FieldMappingPage';
import ReportManagementPage from './pages/ReportManagementPage';
import ReportDetailPage from './pages/ReportDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import AgentConversationFlowPage from './pages/AgentConversationFlowPage';
import WhatIfAgentPage from './pages/WhatIfAgentPage';
import ForwardAgentPage from './pages/ForwardAgentPage';
import BackwardAgentPage from './pages/BackwardAgentPage';
import ConstraintAgentPage from './pages/ConstraintAgentPage';
import DiffAgentPage from './pages/DiffAgentPage';
import PatternAgentPage from './pages/PatternAgentPage';
import UserDetailPage from './pages/UserDetailPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import VersionHistoryPage from './pages/VersionHistoryPage';
import ValidationDashboardPage from './pages/ValidationDashboardPage';
import NamespaceManagementPage from './pages/NamespaceManagementPage';
import ClassLogicPage from './pages/ClassLogicPage';
import RelationLogicPage from './pages/RelationLogicPage';
import ReasoningGraphPage from './pages/ReasoningGraphPage';
import AddDomainPage from './pages/AddDomainPage';
import RemoveDomainPage from './pages/RemoveDomainPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import ChangeLogPage from './pages/ChangeLogPage';
import PagePlaceholder from './components/PagePlaceholder';
import RequireAuth from './components/RequireAuth';

function ThemedApp() {
  const { primaryColor } = useThemeColor();
  const appTheme = useMemo(() => createTheme(primaryColor), [primaryColor]);

  return (
    <ConfigProvider theme={appTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/domain" element={<RequireAuth><DomainSelection /></RequireAuth>} />
          <Route path="/agent-chat/bottleneck" element={<RequireAuth><AgentConversationFlowPage /></RequireAuth>} />
          <Route path="/agent-chat/what-if" element={<RequireAuth><WhatIfAgentPage /></RequireAuth>} />
          <Route path="/agent-chat/forward" element={<RequireAuth><ForwardAgentPage /></RequireAuth>} />
          <Route path="/agent-chat/backward" element={<RequireAuth><BackwardAgentPage /></RequireAuth>} />
          <Route path="/agent-chat/constraint" element={<RequireAuth><ConstraintAgentPage /></RequireAuth>} />
          <Route path="/agent-chat/diff" element={<RequireAuth><DiffAgentPage /></RequireAuth>} />
          <Route path="/agent-chat/pattern" element={<RequireAuth><PatternAgentPage /></RequireAuth>} />
          <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route index element={<Navigate to="/knowledge-graph" replace />} />
            <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/:classId/edit" element={<ClassEditorPage />} />
            <Route path="relations" element={<RelationsPage />} />
            <Route path="relations/:relationId/edit" element={<RelationEditorPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/:propertyId/edit" element={<PropertyEditorPage />} />
            <Route path="instances" element={<InstancesPage />} />
            <Route path="instances/:instanceId/topology" element={<InstanceTopologyPage />} />
            <Route path="instances/:instanceId/edit" element={<InstanceEditorPage />} />
            <Route path="sparql-query" element={<SparqlQueryPage />} />
            <Route path="reasoning" element={<ReasoningPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
            <Route path="agent-chat" element={<AgentChatPage />} />
            <Route path="task-history" element={<TaskHistoryPage />} />
            <Route path="data-sources" element={<DataSourcesPage />} />
            <Route path="data-sources/add" element={<AddConnectionPage />} />
            <Route path="connectors" element={<ConnectorsPage />} />
            <Route path="field-mapping" element={<FieldMappingPage />} />
            <Route path="report-management" element={<ReportManagementPage />} />
            <Route path="report-management/:reportId" element={<ReportDetailPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
            <Route path="user-management/:userId" element={<UserDetailPage />} />
            <Route path="user-management/:userId/add-domain" element={<AddDomainPage />} />
            <Route path="user-management/:userId/remove-domain" element={<RemoveDomainPage />} />
            <Route path="search" element={<GlobalSearchPage />} />
            <Route path="version-history" element={<VersionHistoryPage />} />
            <Route path="validation" element={<ValidationDashboardPage />} />
            <Route path="namespaces" element={<NamespaceManagementPage />} />
            <Route path="classes/:classId/logic" element={<ClassLogicPage />} />
            <Route path="relations/:relationId/logic" element={<RelationLogicPage />} />
            <Route path="reasoning-graph" element={<ReasoningGraphPage />} />
            <Route path="roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="system-settings" element={<SystemSettingsPage />} />
            <Route path="notifications" element={<NotificationCenterPage />} />
            <Route path="change-log" element={<ChangeLogPage />} />
            <Route path="api-keys" element={<PagePlaceholder title="API Keys" />} />
            <Route path="audit-logs" element={<PagePlaceholder title="Audit Logs" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeColorProvider>
      <ThemedApp />
    </ThemeColorProvider>
  );
}

export default App;
