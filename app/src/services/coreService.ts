/**
 * Core-service API calls.
 *
 * All paths use the `/core/` gateway prefix → StripPrefix=1 → core-service.
 * Backend is under active development; callers should use mock fallback.
 */

import { get, post, type ApiResponse } from '../utils/request';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface PageResult<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

// ---------------------------------------------------------------------------
// Ontology types
// ---------------------------------------------------------------------------

export interface OntologyTreeNode {
  id: number;
  name: string;
  type: 'Class' | 'Relation';
  children?: OntologyTreeNode[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  style: 'solid' | 'dashed';
}

export interface OntologyGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface OntologyVersion {
  id: number;
  tag: string;
  description: string;
  author: string;
  createdAt: string;
  additions: number;
  deletions: number;
}

export interface ValidationResult {
  severity: 'error' | 'warning' | 'passed';
  check: string;
  description: string;
  target: string;
  status: string;
}

export interface ValidationReport {
  overallHealth: number;
  errors: number;
  warnings: number;
  passed: number;
  total: number;
  results: ValidationResult[];
}

// ---------------------------------------------------------------------------
// Class types
// ---------------------------------------------------------------------------

export interface ClassDTO {
  id: number;
  name: string;
  uri?: string;
  description: string;
  ontologyId?: number;
  parentClassId?: number | null;
  parentClassName?: string | null;
  status?: string;
  childCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassListRequest {
  ontologyId?: number;
  name?: string;
  filter?: string; // 'ALL' | 'ROOT' | 'LEAF'
}

export interface CreateClassRequest {
  ontologyId: number;
  name: string;
  uri: string;
  description?: string;
  parentClassId?: number | null;
}

export interface UpdateClassRequest {
  id: number;
  name?: string;
  uri?: string;
  description?: string;
  parentClassId?: number | null;
  status?: string;
}

export interface ClassLogicDTO {
  id: number;
  classId: number;
  logicType: string;
  expression: string;
}

export interface UpdateClassLogicRequest {
  classId: number;
  logics: Omit<ClassLogicDTO, 'id'>[];
}

// ---------------------------------------------------------------------------
// NL Analysis types (Class Axiom)
// ---------------------------------------------------------------------------

export interface AnalyzeClassAxiomRequest {
  classId: number;
  naturalLanguageText: string;
  ontologyContext?: boolean;
}

export interface NlpParsedComponent {
  label: string;
  value: string;
}

export interface NlpValidationResult {
  syntaxValid: 'passed' | 'warning' | 'failed';
  noConflicts: 'passed' | 'warning' | 'failed';
  satisfiable: 'passed' | 'warning' | 'failed';
  hierarchyConsistent: 'passed' | 'warning' | 'failed';
  errors: string[];
  warnings: string[];
}

export interface AxiomAnalysisResult {
  confidence: number;
  axiomType: string;
  parsedComponents: NlpParsedComponent[];
  formalExpression: string;
  owlExpression: string;
  validation: NlpValidationResult;
  suggestedLogicType: string;
  suggestedExpression: string;
}

// ---------------------------------------------------------------------------
// NL Analysis types (Relation Rule)
// ---------------------------------------------------------------------------

export interface AnalyzeRelationRuleRequest {
  relationId: number;
  naturalLanguageText: string;
  ontologyContext?: boolean;
}

export interface RuleAnalysisResult {
  confidence: number;
  ruleType: string;
  parsedComponents: NlpParsedComponent[];
  formalExpression: string;
  owlExpression: string;
  validation: NlpValidationResult;
  suggestedLogicType: string;
  suggestedExpression: string;
}

// ---------------------------------------------------------------------------
// Namespace types
// ---------------------------------------------------------------------------

export interface NamespaceDTO {
  id: number;
  prefix: string;
  uri: string;
  type: 'Standard' | 'Custom';
  description?: string;
}

export interface CreateNamespaceRequest {
  prefix: string;
  uri: string;
  type?: 'Standard' | 'Custom';
  description?: string;
}

export interface UpdateNamespaceRequest {
  id: number;
  prefix?: string;
  uri?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Ontology Management types
// ---------------------------------------------------------------------------

export interface OntologyDTO {
  id: number;
  name: string;
  description: string;
  uri: string;
  status: 'Published' | 'Draft';
  version: string;
  classCount: number;
  relationCount: number;
  propertyCount: number;
  instanceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOntologyRequest {
  name: string;
  description?: string;
  uri: string;
  version?: string;
  status?: string;
}

export interface UpdateOntologyRequest {
  id: number;
  name?: string;
  description?: string;
  uri?: string;
  version?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Ontology APIs
// ---------------------------------------------------------------------------

/** List ontologies */
export function listOntologies(params: { keyword?: string; status?: string } = {}): Promise<ApiResponse<OntologyDTO[]>> {
  return post<OntologyDTO[]>('/core/api/v1/core/ontology/list', params);
}

/** Get a single ontology by id */
export function getOntology(id: number): Promise<ApiResponse<OntologyDTO>> {
  return post<OntologyDTO>('/core/api/v1/core/ontology/get', { id });
}

/** Create a new ontology */
export function createOntology(params: CreateOntologyRequest): Promise<ApiResponse<OntologyDTO>> {
  return post<OntologyDTO>('/core/api/v1/core/ontology/create', params);
}

/** Update an existing ontology */
export function updateOntology(params: UpdateOntologyRequest): Promise<ApiResponse<OntologyDTO>> {
  return post<OntologyDTO>('/core/api/v1/core/ontology/update', params);
}

/** Delete an ontology by id */
export function deleteOntology(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/ontology/delete', { id });
}

/** Fetch the ontology tree (left panel search/browse) */
export function fetchOntologyTree(keyword?: string): Promise<ApiResponse<OntologyTreeNode[]>> {
  return post<OntologyTreeNode[]>('/core/api/v1/core/ontology/tree', { keyword });
}

/** Fetch the knowledge graph visualisation data */
export function fetchOntologyGraph(ontologyId: number): Promise<ApiResponse<OntologyGraphData>> {
  return post<OntologyGraphData>('/core/api/v1/core/ontology/graph', { ontologyId });
}

/** Fetch ontology version history */
export function fetchOntologyVersions(): Promise<ApiResponse<OntologyVersion[]>> {
  return post<OntologyVersion[]>('/core/api/v1/core/ontology/versions');
}

/** Run ontology validation */
export function runOntologyValidation(): Promise<ApiResponse<ValidationReport>> {
  return post<ValidationReport>('/core/api/v1/core/ontology/validate');
}

// ---------------------------------------------------------------------------
// Class APIs
// ---------------------------------------------------------------------------

/** List classes (filtered) */
export function listClasses(params: ClassListRequest = {}): Promise<ApiResponse<ClassDTO[]>> {
  return post<ClassDTO[]>('/core/api/v1/core/class/list', params);
}

/** Get a single class by id */
export function getClass(id: number): Promise<ApiResponse<ClassDTO>> {
  return post<ClassDTO>('/core/api/v1/core/class/get', { id });
}

/** Create a new class */
export function createClass(params: CreateClassRequest): Promise<ApiResponse<ClassDTO>> {
  return post<ClassDTO>('/core/api/v1/core/class/create', params);
}

/** Update an existing class */
export function updateClass(params: UpdateClassRequest): Promise<ApiResponse<ClassDTO>> {
  return post<ClassDTO>('/core/api/v1/core/class/update', params);
}

/** Delete a class by id */
export function deleteClass(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/class/delete', { id });
}

// ---------------------------------------------------------------------------
// Class Logic APIs
// ---------------------------------------------------------------------------

/** Get logic axioms for a class */
export function getClassLogic(classId: number): Promise<ApiResponse<ClassLogicDTO[]>> {
  return post<ClassLogicDTO[]>('/core/api/v1/core/class/logic/get', { classId });
}

/** Update logic axioms for a class */
export function updateClassLogic(params: UpdateClassLogicRequest): Promise<ApiResponse<ClassLogicDTO[]>> {
  return post<ClassLogicDTO[]>('/core/api/v1/core/class/logic/update', params);
}

/** Analyze a class axiom from natural language */
export function analyzeClassAxiom(params: AnalyzeClassAxiomRequest): Promise<ApiResponse<AxiomAnalysisResult>> {
  return post<AxiomAnalysisResult>('/core/api/v1/core/class/logic/analyze', params);
}

// ---------------------------------------------------------------------------
// Relation Logic types & APIs
// ---------------------------------------------------------------------------

export interface RelationLogicDTO {
  id: number;
  relationId: number;
  logicType: string;
  expression: string;
}

export interface UpdateRelationLogicRequest {
  relationId: number;
  logics: Omit<RelationLogicDTO, 'id'>[];
}

/** Get logic rules for a relation */
export function getRelationLogic(relationId: number): Promise<ApiResponse<RelationLogicDTO[]>> {
  return post<RelationLogicDTO[]>('/core/api/v1/core/relation/logic/get', { relationId });
}

/** Update logic rules for a relation */
export function updateRelationLogic(params: UpdateRelationLogicRequest): Promise<ApiResponse<RelationLogicDTO[]>> {
  return post<RelationLogicDTO[]>('/core/api/v1/core/relation/logic/update', params);
}

/** Analyze a relation rule from natural language */
export function analyzeRelationRule(params: AnalyzeRelationRuleRequest): Promise<ApiResponse<RuleAnalysisResult>> {
  return post<RuleAnalysisResult>('/core/api/v1/core/relation/logic/analyze', params);
}

// ---------------------------------------------------------------------------
// Namespace APIs
// ---------------------------------------------------------------------------

/** List all namespaces */
export function listNamespaces(): Promise<ApiResponse<NamespaceDTO[]>> {
  return get<NamespaceDTO[]>('/core/api/v1/core/namespace/list');
}

/** Create a new namespace */
export function createNamespace(params: CreateNamespaceRequest): Promise<ApiResponse<NamespaceDTO>> {
  return post<NamespaceDTO>('/core/api/v1/core/namespace/create', params);
}

/** Update a namespace */
export function updateNamespace(params: UpdateNamespaceRequest): Promise<ApiResponse<NamespaceDTO>> {
  return post<NamespaceDTO>('/core/api/v1/core/namespace/update', params);
}

/** Delete a namespace by id */
export function deleteNamespace(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/namespace/delete', { id });
}

// ---------------------------------------------------------------------------
// Property types
// ---------------------------------------------------------------------------

export interface PropertyDTO {
  id: number;
  ontologyId: number;
  name: string;
  uri: string;
  description: string;
  dataType: string;
  constraints: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListPropertyRequest {
  ontologyId: number;
}

export interface CreatePropertyRequest {
  ontologyId: number;
  name: string;
  uri?: string;
  description?: string;
  dataType?: string;
  constraints?: string;
}

export interface UpdatePropertyRequest {
  id: number;
  name?: string;
  uri?: string;
  description?: string;
  dataType?: string;
  constraints?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Property APIs
// ---------------------------------------------------------------------------

/** List properties filtered by ontology */
export function listProperties(params: ListPropertyRequest): Promise<ApiResponse<PropertyDTO[]>> {
  return post<PropertyDTO[]>('/core/api/v1/core/property/list', params);
}

/** Get a single property by id */
export function getProperty(id: number): Promise<ApiResponse<PropertyDTO>> {
  return post<PropertyDTO>('/core/api/v1/core/property/get', { id });
}

/** Create a new property */
export function createProperty(params: CreatePropertyRequest): Promise<ApiResponse<PropertyDTO>> {
  return post<PropertyDTO>('/core/api/v1/core/property/create', params);
}

/** Update an existing property */
export function updateProperty(params: UpdatePropertyRequest): Promise<ApiResponse<PropertyDTO>> {
  return post<PropertyDTO>('/core/api/v1/core/property/update', params);
}

/** Delete a property by id */
export function deleteProperty(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/property/delete', { id });
}

// ---------------------------------------------------------------------------
// Relation types
// ---------------------------------------------------------------------------

export interface RelationDTO {
  id: number;
  ontologyId: number;
  name: string;
  uri: string;
  description: string;
  domainClassId: number | null;
  domainClassName: string | null;
  rangeClassId: number | null;
  rangeClassName: string | null;
  isFunctional: boolean;
  isInverseFunctional: boolean;
  isSymmetric: boolean;
  isTransitive: boolean;
  cardinality: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListRelationRequest {
  ontologyId: number;
}

export interface CreateRelationRequest {
  ontologyId: number;
  name: string;
  uri?: string;
  description?: string;
  domainClassId?: number | null;
  rangeClassId?: number | null;
  isFunctional?: boolean;
  isInverseFunctional?: boolean;
  isSymmetric?: boolean;
  isTransitive?: boolean;
  cardinality?: string;
}

export interface UpdateRelationRequest {
  id: number;
  name?: string;
  uri?: string;
  description?: string;
  domainClassId?: number | null;
  rangeClassId?: number | null;
  isFunctional?: boolean;
  isInverseFunctional?: boolean;
  isSymmetric?: boolean;
  isTransitive?: boolean;
  cardinality?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Relation APIs
// ---------------------------------------------------------------------------

/** List relations filtered by ontology */
export function listRelations(params: ListRelationRequest): Promise<ApiResponse<RelationDTO[]>> {
  return post<RelationDTO[]>('/core/api/v1/core/relation/list', params);
}

/** Get a single relation by id */
export function getRelation(id: number): Promise<ApiResponse<RelationDTO>> {
  return post<RelationDTO>('/core/api/v1/core/relation/get', { id });
}

/** Create a new relation */
export function createRelation(params: CreateRelationRequest): Promise<ApiResponse<RelationDTO>> {
  return post<RelationDTO>('/core/api/v1/core/relation/create', params);
}

/** Update an existing relation */
export function updateRelation(params: UpdateRelationRequest): Promise<ApiResponse<RelationDTO>> {
  return post<RelationDTO>('/core/api/v1/core/relation/update', params);
}

/** Delete a relation by id */
export function deleteRelation(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/relation/delete', { id });
}

// ---------------------------------------------------------------------------
// ClassProperty (bind/unbind) types & APIs
// ---------------------------------------------------------------------------

export interface ClassPropertyDTO {
  id: number;
  classId: number;
  propertyId: number;
  propertyName: string;
  propertyUri: string;
  dataType: string;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue: string;
  sortOrder: number;
}

export interface ClassPropertyBinding {
  propertyId: number;
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  sortOrder?: number;
}

/** List properties bound to a class */
export function listClassProperties(classId: number): Promise<ApiResponse<ClassPropertyDTO[]>> {
  return post<ClassPropertyDTO[]>('/core/api/v1/core/class/property/list', { classId });
}

/** Bind properties to a class */
export function bindClassProperties(classId: number, bindings: ClassPropertyBinding[]): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/class/property/bindList', { classId, bindings });
}

/** Unbind a property from a class */
export function unbindClassProperty(classId: number, propertyId: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/class/property/unbind', { classId, propertyId });
}

// ---------------------------------------------------------------------------
// ClassRelation (bind/unbind) types & APIs
// ---------------------------------------------------------------------------

export interface ClassRelationDTO {
  id: number;
  classId: number;
  relationId: number;
  relationName: string;
  domainClassName: string;
  rangeClassName: string;
  sortOrder: number;
}

export interface ClassRelationBinding {
  relationId: number;
  sortOrder?: number;
}

/** List relations bound to a class */
export function listClassRelations(classId: number): Promise<ApiResponse<ClassRelationDTO[]>> {
  return post<ClassRelationDTO[]>('/core/api/v1/core/class/relation/list', { classId });
}

/** Bind relations to a class */
export function bindClassRelations(classId: number, bindings: ClassRelationBinding[]): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/class/relation/bindList', { classId, bindings });
}

/** Unbind a relation from a class */
export function unbindClassRelation(classId: number, relationId: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/class/relation/unbind', { classId, relationId });
}

// ---------------------------------------------------------------------------
// Instance types
// ---------------------------------------------------------------------------

export interface InstanceDTO {
  id: number;
  ontologyId: number;
  classId: number;
  className: string;
  name: string;
  description: string;
  domain?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstancePropertyValueDTO {
  id: number;
  instanceId: number;
  propertyId: number;
  propertyName: string;
  dataType: string;
  value: string;
}

export interface InstanceRelationDTO {
  id: number;
  instanceId: number;
  relationId: number;
  relationName: string;
  targetInstanceId: number;
  targetInstanceName: string;
  targetClassName: string;
}

export interface ListInstanceRequest {
  ontologyId?: number;
  classId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreateInstanceRequest {
  ontologyId: number;
  classId: number;
  name: string;
  description?: string;
  domain?: string;
}

export interface UpdateInstanceRequest {
  id: number;
  name?: string;
  description?: string;
  classId?: number;
  domain?: string;
  status?: string;
}

export interface SaveInstancePropertyValueRequest {
  instanceId: number;
  values: { propertyId: number; value: string }[];
}

export interface BindInstanceRelationRequest {
  sourceInstanceId: number;
  relationId: number;
  targetInstanceId: number;
}

export interface InstanceTopologyData {
  nodes: { id: string; label: string; type: string; color?: string }[];
  links: { source: string; target: string; label: string; color?: string }[];
}

export interface InstanceTopologyDTO {
  nodes: {
    instanceId: number;
    instanceName: string;
    classId: number;
    className: string;
  }[];
  edges: {
    sourceInstanceId: number;
    targetInstanceId: number;
    relationId: number;
    relationName: string;
  }[];
}

export interface MultiClassTopologyRequest {
  ontologyId?: number;
  classIds: number[];
  limit?: number;
}

// ---------------------------------------------------------------------------
// Instance APIs
// ---------------------------------------------------------------------------

/** List instances (paginated) */
export function listInstances(params: ListInstanceRequest = {}): Promise<ApiResponse<PageResult<InstanceDTO>>> {
  return post<PageResult<InstanceDTO>>('/core/api/v1/core/instance/list', params);
}

/** Get a single instance by id */
export function getInstance(id: number): Promise<ApiResponse<InstanceDTO>> {
  return post<InstanceDTO>('/core/api/v1/core/instance/get', { id });
}

/** Create a new instance */
export function createInstance(params: CreateInstanceRequest): Promise<ApiResponse<InstanceDTO>> {
  return post<InstanceDTO>('/core/api/v1/core/instance/create', params);
}

/** Update an existing instance */
export function updateInstance(params: UpdateInstanceRequest): Promise<ApiResponse<InstanceDTO>> {
  return post<InstanceDTO>('/core/api/v1/core/instance/update', params);
}

/** Delete an instance by id */
export function deleteInstance(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/instance/delete', { id });
}

/** Get property values for an instance */
export function listInstancePropertyValues(instanceId: number): Promise<ApiResponse<InstancePropertyValueDTO[]>> {
  return post<InstancePropertyValueDTO[]>('/core/api/v1/core/instance/property/get', { instanceId });
}

/** Save property values for an instance */
export function saveInstancePropertyValues(params: SaveInstancePropertyValueRequest): Promise<ApiResponse<InstancePropertyValueDTO[]>> {
  return post<InstancePropertyValueDTO[]>('/core/api/v1/core/instance/property/update', params);
}

/** List relations for an instance */
export function listInstanceRelations(instanceId: number): Promise<ApiResponse<InstanceRelationDTO[]>> {
  return post<InstanceRelationDTO[]>('/core/api/v1/core/instance/relation/list', { id: instanceId });
}

/** Bind a relation to an instance */
export function bindInstanceRelation(params: BindInstanceRelationRequest): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/instance/relation/add', params);
}

/** Unbind a relation from an instance */
export function unbindInstanceRelation(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/core/instance/relation/remove', { id });
}

/** Get topology data for an instance */
export function getInstanceTopology(instanceId: number): Promise<ApiResponse<InstanceTopologyDTO>> {
  return post<InstanceTopologyDTO>('/core/api/v1/core/instance/topology', { instanceId });
}

/** Get multi-class instance topology */
export function fetchMultiClassInstanceTopology(params: MultiClassTopologyRequest): Promise<ApiResponse<InstanceTopologyDTO>> {
  return post<InstanceTopologyDTO>('/core/api/v1/core/instance/multi-topology', params);
}

// ---------------------------------------------------------------------------
// Topology types
// ---------------------------------------------------------------------------

export interface TopologyDTO {
  id: number;
  ontologyId: number;
  name: string;
  description: string;
  classIds: number[];
  classCount: number;
  instanceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopologyRequest {
  ontologyId: number;
  name: string;
  description?: string;
  classIds: number[];
}

export interface UpdateTopologyRequest {
  id: number;
  name?: string;
  description?: string;
  classIds?: number[];
}

// ---------------------------------------------------------------------------
// Topology APIs
// ---------------------------------------------------------------------------

/** List topologies for the current ontology */
export async function listTopologies(params: { ontologyId?: number; keyword?: string } = {}): Promise<ApiResponse<TopologyDTO[]>> {
  return await post<TopologyDTO[]>('/core/api/v1/core/topology/list', params);
}

/** Get a single topology by id */
export async function getTopology(id: number): Promise<ApiResponse<TopologyDTO>> {
  return await post<TopologyDTO>('/core/api/v1/core/topology/get', { id });
}

/** Create a new topology */
export async function createTopology(params: CreateTopologyRequest): Promise<ApiResponse<TopologyDTO>> {
  return await post<TopologyDTO>('/core/api/v1/core/topology/create', params);
}

/** Update an existing topology */
export async function updateTopology(params: UpdateTopologyRequest): Promise<ApiResponse<TopologyDTO>> {
  return await post<TopologyDTO>('/core/api/v1/core/topology/update', params);
}

/** Delete a topology by id */
export async function deleteTopology(id: number): Promise<ApiResponse<null>> {
  return await post<null>('/core/api/v1/core/topology/delete', { id });
}
