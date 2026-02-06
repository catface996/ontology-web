# Ontology Management System

Enterprise-grade ontology management platform for building, visualizing, and reasoning over knowledge graphs. Built with React 19, Material-UI v7, D3.js, and TypeScript.

## Architecture

```mermaid
graph TB
    subgraph Client["Frontend (SPA)"]
        main["main.tsx"] --> App["App.tsx<br/>ThemeProvider + Router"]
        App --> Login["LoginPage"]
        App --> Domain["DomainSelection"]
        App --> AgentPages["Agent Pages<br/>(new tab)"]
        App --> MainLayout["MainLayout"]
        MainLayout --> Sidebar["Sidebar (280px)"]
        MainLayout --> Outlet["Page Outlet"]
    end

    style Client fill:#0d0d14,stroke:#8b5cf6,color:#f4f4f5
    style App fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style MainLayout fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style Sidebar fill:#1a1a2e,stroke:#3b82f6,color:#f4f4f5
    style Outlet fill:#1a1a2e,stroke:#3b82f6,color:#f4f4f5
    style Login fill:#1a1a2e,stroke:#71717a,color:#a1a1aa
    style Domain fill:#1a1a2e,stroke:#71717a,color:#a1a1aa
    style AgentPages fill:#1a1a2e,stroke:#f59e0b,color:#f4f4f5
    style main fill:#1a1a2e,stroke:#71717a,color:#a1a1aa
```

## Tech Stack

```mermaid
graph LR
    subgraph Build
        Vite["Vite 7"]
        TS["TypeScript 5.9"]
    end
    subgraph Core
        React["React 19.2"]
        Router["React Router 7"]
    end
    subgraph UI
        MUI["Material-UI 7"]
        Emotion["Emotion"]
        Lucide["Lucide Icons"]
    end
    subgraph Visualization
        D3["D3.js 7"]
        CM["CodeMirror"]
    end

    Vite --> React
    TS --> React
    React --> MUI
    React --> Router
    MUI --> Emotion
    React --> D3
    React --> CM

    style Build fill:#1e1b4b,stroke:#6366f1,color:#f4f4f5
    style Core fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style UI fill:#1a1a2e,stroke:#3b82f6,color:#f4f4f5
    style Visualization fill:#1a1a2e,stroke:#22c55e,color:#f4f4f5
```

## Features

### Ontology Modeling

```mermaid
erDiagram
    Class ||--o{ Property : has
    Class ||--o{ Instance : instantiates
    Class }o--o{ Relation : connected_by
    Relation }o--|| Class : from
    Relation }o--|| Class : to
    Property ||--o{ Constraint : constrained_by
    Instance }o--o{ Instance : linked_via_relation

    Class {
        string name
        string description
        string icon
        Class parent
    }
    Relation {
        string name
        string type
        Class domain
        Class range
    }
    Property {
        string name
        string datatype
        boolean required
    }
    Instance {
        string name
        Class type
        map properties
    }
```

- **Classes** -- Create and manage ontology classes with inheritance hierarchies, properties, and icons
- **Relations** -- Define typed relationships between classes (e.g., `connects_to`, `uses`)
- **Properties** -- Configure properties with type-specific constraints (String, Integer, Decimal, Boolean, Date, Enum)
- **Instances** -- Manage concrete instances of ontology classes with topology visualization

### Knowledge Graph

- Interactive D3.js graph visualization with drag, zoom, and selection
- Real-time node/link highlighting with glow effects
- Search and filter across classes, relations, and properties

### AI Agent Workflows

Seven specialized agent conversation flows, each with a 3-panel layout and D3.js topology graphs:

```mermaid
graph TD
    Agent["Agent Chat Hub"]
    Agent --> B["Bottleneck<br/>#8b5cf6"]
    Agent --> W["What-If<br/>#f59e0b"]
    Agent --> F["Forward<br/>#06b6d4"]
    Agent --> BK["Backward<br/>#a855f7"]
    Agent --> C["Constraint<br/>#6366f1"]
    Agent --> D["Diff<br/>#10b981"]
    Agent --> P["Pattern<br/>#ec4899"]

    B -->|identifies| B1["Performance<br/>bottlenecks"]
    W -->|simulates| W1["Before / After<br/>topology changes"]
    F -->|traces| F1["Forward propagation<br/>from source"]
    BK -->|traces| BK1["Backward to<br/>root causes"]
    C -->|validates| C1["Constraints<br/>on topology"]
    D -->|compares| D1["Snapshot diffs<br/>add/remove/modify"]
    P -->|detects| P1["Structural patterns<br/>hub-spoke, chain"]

    style Agent fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style B fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style W fill:#1a1a2e,stroke:#f59e0b,color:#f4f4f5
    style F fill:#1a1a2e,stroke:#06b6d4,color:#f4f4f5
    style BK fill:#1a1a2e,stroke:#a855f7,color:#f4f4f5
    style C fill:#1a1a2e,stroke:#6366f1,color:#f4f4f5
    style D fill:#1a1a2e,stroke:#10b981,color:#f4f4f5
    style P fill:#1a1a2e,stroke:#ec4899,color:#f4f4f5
    style B1 fill:#0d0d14,stroke:#8b5cf6,color:#a1a1aa
    style W1 fill:#0d0d14,stroke:#f59e0b,color:#a1a1aa
    style F1 fill:#0d0d14,stroke:#06b6d4,color:#a1a1aa
    style BK1 fill:#0d0d14,stroke:#a855f7,color:#a1a1aa
    style C1 fill:#0d0d14,stroke:#6366f1,color:#a1a1aa
    style D1 fill:#0d0d14,stroke:#10b981,color:#a1a1aa
    style P1 fill:#0d0d14,stroke:#ec4899,color:#a1a1aa
```

Each agent page layout:

```mermaid
graph LR
    subgraph AgentPage["Agent Page (new tab)"]
        direction LR
        Left["Execution Sidebar<br/>260px<br/>─────────<br/>Step list<br/>Progress<br/>Stats"]
        Center["Chat Panel<br/>flex: 1<br/>─────────<br/>Messages<br/>D3 Topology Graphs<br/>Analysis Cards<br/>Input Bar"]
        Right["Context Panel<br/>340px<br/>─────────<br/>Summary<br/>Metrics<br/>Actions"]
    end

    style AgentPage fill:#0a0a0f,stroke:#27273a,color:#f4f4f5
    style Left fill:#0d0d14,stroke:#27273a,color:#a1a1aa
    style Center fill:#0a0a0f,stroke:#8b5cf6,color:#f4f4f5
    style Right fill:#0d0d14,stroke:#27273a,color:#a1a1aa
```

### Tools

- **SPARQL Query** -- CodeMirror-based SPARQL editor with syntax highlighting
- **Reasoning** -- OWL reasoning engine integration
- **Import/Export** -- Bulk ontology data import and export

### Integrations

- **Data Sources** -- Connect to external databases and services
- **Connectors** -- Manage integration connectors
- **Field Mapping** -- Map fields between external sources and ontology properties

### Administration

- **Reports** -- Report management and detail views
- **User Management** -- User accounts and profiles
- **Roles & Permissions** -- Role-based access control
- **API Keys** -- API key management
- **Audit Logs** -- Activity tracking

## Route Map

```mermaid
graph TD
    Root["/"] -->|redirect| KG["/knowledge-graph"]

    subgraph MainLayout["MainLayout (Sidebar + Outlet)"]
        KG["Knowledge Graph"]

        subgraph Ontology
            CL["/classes"]
            CL --> CLE["/classes/:id/edit"]
            RL["/relations"]
            RL --> RLE["/relations/:id/edit"]
            PR["/properties"]
            PR --> PRE["/properties/:id/edit"]
            IN["/instances"]
            IN --> INE["/instances/:id/edit"]
            IN --> INT["/instances/:id/topology"]
        end

        subgraph Tools
            SQ["/sparql-query"]
            RS["/reasoning"]
            IE["/import-export"]
            RP["/report-management"]
            RP --> RPD["/report-management/:id"]
        end

        subgraph Integrations
            DS["/data-sources"]
            DS --> DSA["/data-sources/add"]
            CO["/connectors"]
            FM["/field-mapping"]
        end

        subgraph Settings
            UM["/user-management"]
            RO["/roles-permissions"]
            AK["/api-keys"]
            AL["/audit-logs"]
        end

        AC["/agent-chat"]
        TH["/task-history"]
    end

    subgraph AgentFlows["Agent Flows (standalone)"]
        AB["/agent-chat/bottleneck"]
        AW["/agent-chat/what-if"]
        AF["/agent-chat/forward"]
        ABK["/agent-chat/backward"]
        ACO["/agent-chat/constraint"]
        AD["/agent-chat/diff"]
        AP["/agent-chat/pattern"]
    end

    LO["/login"]
    DO["/domain"]

    style MainLayout fill:#0d0d14,stroke:#8b5cf6,color:#f4f4f5
    style Ontology fill:#1a1a2e,stroke:#3b82f6,color:#f4f4f5
    style Tools fill:#1a1a2e,stroke:#22c55e,color:#f4f4f5
    style Integrations fill:#1a1a2e,stroke:#f59e0b,color:#f4f4f5
    style Settings fill:#1a1a2e,stroke:#71717a,color:#f4f4f5
    style AgentFlows fill:#0d0d14,stroke:#ec4899,color:#f4f4f5
```

## Component Hierarchy

```mermaid
graph TD
    App["App.tsx"]
    App --> ThemeProvider
    App --> BrowserRouter
    BrowserRouter --> Routes

    Routes --> MainLayout
    MainLayout --> Sidebar
    MainLayout --> Pages["Page Components"]

    Pages --> Lists["List Pages<br/>Classes, Relations,<br/>Properties, Instances"]
    Pages --> Editors["Editor Pages<br/>ClassEditor, RelationEditor,<br/>PropertyEditor, InstanceEditor"]
    Pages --> Viz["Visualization Pages<br/>KnowledgeGraph,<br/>InstanceTopology"]

    Lists --> Pagination
    Editors --> ConfirmDeleteModal
    Editors --> SuccessModal
    Editors --> PropertyConstraints

    PropertyConstraints --> SC["StringConstraints"]
    PropertyConstraints --> IC["IntegerConstraints"]
    PropertyConstraints --> DC["DecimalConstraints"]
    PropertyConstraints --> BC["BooleanConstraints"]
    PropertyConstraints --> DtC["DateConstraints"]
    PropertyConstraints --> EC["EnumConstraints"]

    Routes --> AgentPages["Agent Pages<br/>(standalone)"]
    AgentPages --> D3TopologyGraph

    style App fill:#1a1a2e,stroke:#8b5cf6,color:#f4f4f5
    style MainLayout fill:#1a1a2e,stroke:#3b82f6,color:#f4f4f5
    style Sidebar fill:#0d0d14,stroke:#3b82f6,color:#a1a1aa
    style Pages fill:#1a1a2e,stroke:#22c55e,color:#f4f4f5
    style AgentPages fill:#1a1a2e,stroke:#ec4899,color:#f4f4f5
    style D3TopologyGraph fill:#0d0d14,stroke:#ec4899,color:#a1a1aa
    style PropertyConstraints fill:#0d0d14,stroke:#22c55e,color:#a1a1aa
    style Lists fill:#0d0d14,stroke:#22c55e,color:#a1a1aa
    style Editors fill:#0d0d14,stroke:#22c55e,color:#a1a1aa
    style Viz fill:#0d0d14,stroke:#22c55e,color:#a1a1aa
```

## Project Structure

```
app/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Router and theme provider
│   ├── MainLayout.tsx            # Sidebar + content layout
│   ├── LoginPage.tsx             # Authentication
│   ├── DomainSelection.tsx       # Domain/workspace selector
│   ├── theme.ts                  # MUI dark theme configuration
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation drawer (280px)
│   │   ├── D3TopologyGraph.tsx   # Shared D3 topology graph
│   │   ├── Pagination.tsx        # Reusable pagination
│   │   ├── PagePlaceholder.tsx   # Stub page component
│   │   ├── ConfirmDeleteModal.tsx
│   │   ├── SuccessModal.tsx
│   │   └── PropertyConstraints/  # Type-specific constraint editors
│   └── pages/                    # 30 page components
│       ├── KnowledgeGraphPage.tsx
│       ├── Classes/Relations/Properties/InstancesPage.tsx
│       ├── *EditorPage.tsx
│       ├── SparqlQueryPage.tsx
│       ├── ReasoningPage.tsx
│       ├── ImportExportPage.tsx
│       ├── Agent*Page.tsx        # 7 agent conversation flows
│       ├── DataSourcesPage.tsx
│       ├── ConnectorsPage.tsx
│       ├── FieldMappingPage.tsx
│       ├── Report*Page.tsx
│       ├── UserManagementPage.tsx
│       └── RolesPermissionsPage.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Theme

Dark theme with a purple accent:

| Token | Value |
|-------|-------|
| Primary | `#8b5cf6` |
| Background | `#0a0a0f` |
| Paper | `#0d0d14` |
| Text Primary | `#f4f4f5` |
| Text Secondary | `#a1a1aa` |
| Divider | `#27273a` |

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173/` in the browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
