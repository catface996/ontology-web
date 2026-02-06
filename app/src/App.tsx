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
            <Route path="relations/:relationId/edit" element={<PagePlaceholder title="Relation Editor" />} />
            <Route path="properties" element={<PagePlaceholder title="Properties" />} />
            <Route path="instances" element={<PagePlaceholder title="Instances" />} />
            <Route path="sparql-query" element={<PagePlaceholder title="SPARQL Query" />} />
            <Route path="reasoning" element={<PagePlaceholder title="Reasoning" />} />
            <Route path="import-export" element={<PagePlaceholder title="Import/Export" />} />
            <Route path="agent-chat" element={<PagePlaceholder title="Agent Chat" />} />
            <Route path="task-history" element={<PagePlaceholder title="Task History" />} />
            <Route path="data-sources" element={<PagePlaceholder title="Data Sources" />} />
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
