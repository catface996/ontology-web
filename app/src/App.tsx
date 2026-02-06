import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import LoginPage from './LoginPage';
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
import PagePlaceholder from './components/PagePlaceholder';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/domain" element={<DomainSelection />} />
          <Route path="/" element={<MainLayout />}>
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
            <Route path="connectors" element={<PagePlaceholder title="Connectors" />} />
            <Route path="field-mapping" element={<PagePlaceholder title="Field Mapping" />} />
            <Route path="user-management" element={<PagePlaceholder title="User Management" />} />
            <Route path="roles-permissions" element={<PagePlaceholder title="Roles & Permissions" />} />
            <Route path="api-keys" element={<PagePlaceholder title="API Keys" />} />
            <Route path="audit-logs" element={<PagePlaceholder title="Audit Logs" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
