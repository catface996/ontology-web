import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Input, Tag, Button } from 'antd';
import {
  Search, Filter,
  Boxes, Link as LinkIcon, List as ListIcon,
  Database, Shield,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type ResultType = 'Class' | 'Relation' | 'Property' | 'Instance' | 'Axiom';
type FilterKey = 'All' | 'Classes' | 'Relations' | 'Properties' | 'Instances' | 'Axioms';

interface SearchResult {
  name: string;
  type: ResultType;
  uri: string;
  description: string;
}

/* -- Config -- */
const typeConfig: Record<ResultType, { icon: React.ReactNode; color: string; bg: string }> = {
  Class:    { icon: <Boxes size={18} />,    color: 'var(--primary-color)', bg: 'var(--primary-color)' },
  Relation: { icon: <LinkIcon size={18} />, color: '#22c55e', bg: '#000000' },
  Property: { icon: <ListIcon size={18} />, color: '#f59e0b', bg: '#000000' },
  Instance: { icon: <Database size={18} />, color: '#3b82f6', bg: '#000000' },
  Axiom:    { icon: <Shield size={18} />,   color: '#D93C15', bg: '#1a1a24' },
};

const badgeTextColor: Record<ResultType, string> = {
  Class: '#ffffff',
  Relation: '#22c55e',
  Property: '#f59e0b',
  Instance: '#3b82f6',
  Axiom: '#f4f4f5',
};

/* -- Mock data -- */
const mockResults: SearchResult[] = [
  { name: 'Person', type: 'Class', uri: 'ent:Person', description: 'Represents a human individual in the ontology. Subclass of owl:Thing with properties: hasName, hasAge, hasEmployee.' },
  { name: 'hasEmployee', type: 'Relation', uri: 'ent:hasEmployee', description: 'Object property linking Organization to Person. Domain: Organization, Range: Person. Inverse of worksFor.' },
  { name: 'hasName', type: 'Property', uri: 'ent:hasName', description: 'Datatype property of type xsd:string. Functional property with max cardinality 1. Applied to Person, Organization.' },
  { name: 'John Smith', type: 'Instance', uri: 'ent:john_smith_001', description: 'Instance of Person. Properties: hasName="John Smith", hasAge=34, worksFor=AcmeCorp.' },
  { name: 'Organization', type: 'Class', uri: 'ent:Organization', description: 'Represents a corporate entity or institution. Subclass of owl:Thing. Has 3 relations, 5 properties, 12 instances.' },
  { name: 'Person \u2293 Organization \u2291 \u22A5', type: 'Axiom', uri: '', description: 'Disjointness axiom: Person and Organization cannot share instances. OWL type: owl:disjointWith.' },
];

const filters: FilterKey[] = ['All', 'Classes', 'Relations', 'Properties', 'Instances', 'Axioms'];

const filterToType: Record<FilterKey, ResultType | null> = {
  All: null,
  Classes: 'Class',
  Relations: 'Relation',
  Properties: 'Property',
  Instances: 'Instance',
  Axioms: 'Axiom',
};

/* -- Page -- */
export default function GlobalSearchPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Tools' },
        { title: 'Global Search' },
      ]} />
    );
    setActions(
      <Button
        icon={<Filter size={16} />}
      >
        Filters
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  const filtered = mockResults.filter((r) => {
    const targetType = filterToType[activeFilter];
    const matchesFilter = targetType === null || r.type === targetType;
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Search Bar */}
        <Input
          placeholder="Search across classes, relations, properties, instances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={16} color="#a1a1aa" />}
          suffix={
            <div style={{ border: '1px solid #303030', borderRadius: 6, padding: '4px 8px' }}>
              <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace' }}>⌘K</Typography.Text>
            </div>
          }
          size="large"
        />

        {/* Filter Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Filter:</Typography.Text>
          {filters.map((f) => (
            <Tag
              key={f}
              color={activeFilter === f ? 'blue' : undefined}
              style={{ cursor: 'pointer', borderRadius: 12 }}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </Tag>
          ))}
        </div>

        {/* Results */}
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            border: '1px solid #303030',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Results Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #303030',
            }}
          >
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Search Results</Typography.Text>
            <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
              Showing {filtered.length} of {mockResults.length} results
            </Typography.Text>
          </div>

          {/* Result Items */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map((result, i) => {
              const cfg = typeConfig[result.type];
              return (
                <div
                  key={`${result.name}-${i}`}
                  style={{
                    padding: '16px 24px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #303030' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>{result.name}</Typography.Text>
                    <span style={{ backgroundColor: cfg.bg, borderRadius: 6, padding: '2px 8px' }}>
                      <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: badgeTextColor[result.type] }}>
                        {result.type}
                      </Typography.Text>
                    </span>
                    {result.uri && (
                      <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}>
                        {result.uri}
                      </Typography.Text>
                    )}
                  </div>
                  {/* Description */}
                  <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', lineHeight: '1.5' }}>
                    {result.description}
                  </Typography.Text>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Typography.Text style={{ color: '#a1a1aa' }}>No results found.</Typography.Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
