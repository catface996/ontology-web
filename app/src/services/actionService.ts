/**
 * Action Service API calls.
 *
 * All paths go through the Gateway at /core/api/v1/actions/...
 */

import { get, post, put, del, type ApiResponse } from '../utils/request';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ENTITY_REFERENCE';
export type RuleType = 'CREATE_INSTANCE' | 'MODIFY_INSTANCE' | 'DELETE_INSTANCE' | 'CREATE_RELATIONSHIP' | 'REMOVE_RELATIONSHIP';
export type ExecutionStatus = 'SUCCESS' | 'FAILED';
export type PermissionType = 'USER' | 'ROLE';

export interface ValidationConstraints {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  classId?: number;
}

export interface ActionParameter {
  parameterName: string;
  dataType: DataType;
  required: boolean;
  validationConstraints?: ValidationConstraints;
  description?: string;
  displayOrder: number;
}

export interface ExecutionRule {
  ruleType: RuleType;
  targetClass?: string;
  targetRelationship?: string;
  propertyMappings?: Record<string, string>;
  outputIdentifier?: string;
  adminOrder: number;
}

export interface ExecutionPermission {
  type: PermissionType;
  id: number;
}

export interface ActionTypeDTO {
  id: number;
  name: string;
  description?: string;
  status: ActionStatus;
  parameters: ActionParameter[];
  executionRules: ExecutionRule[];
  executionPermissions: ExecutionPermission[];
  computedExecutionOrder?: number[];
  createdBy?: number;
  createdAt?: string;
  modifiedAt?: string;
  publishedAt?: string;
  archivedAt?: string;
}

export interface CreateActionTypeRequest {
  name: string;
  description?: string;
  parameters: ActionParameter[];
  executionRules: ExecutionRule[];
}

export interface UpdateActionTypeRequest {
  name?: string;
  description?: string;
  parameters?: ActionParameter[];
  executionRules?: ExecutionRule[];
}

export interface ListActionTypesRequest {
  status?: ActionStatus;
  name?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface GrantPermissionRequest {
  type: PermissionType;
  id: number;
}

export interface ExecutionOperation {
  ruleOrder: number;
  operationType: string;
  targetInstanceId: number;
  operationDetails: Record<string, any>;
}

export interface ExecutionResultDTO {
  executionId: number;
  actionTypeId: number;
  actionTypeName?: string;
  executorId?: number;
  executorName?: string;
  status: ExecutionStatus;
  executionTimestamp: string;
  durationMs: number;
  inputParameters?: Record<string, any>;
  operations?: ExecutionOperation[];
  errorMessage?: string;
  failedRule?: {
    ruleOrder: number;
    ruleType: string;
  };
}

export interface ExecuteActionRequest {
  actionTypeId: number;
  parameters: Record<string, any>;
}

export interface ListExecutionsRequest {
  actionTypeId?: number;
  executorId?: number;
  status?: ExecutionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ---------------------------------------------------------------------------
// Action Type Management APIs
// ---------------------------------------------------------------------------

/**
 * Create a new Action Type in DRAFT status
 */
export function createActionType(data: CreateActionTypeRequest): Promise<ApiResponse<ActionTypeDTO>> {
  return post('/core/api/v1/actions/types', data);
}

/**
 * Update an Action Type (DRAFT only)
 */
export function updateActionType(id: number, data: UpdateActionTypeRequest): Promise<ApiResponse<ActionTypeDTO>> {
  return put(`/core/api/v1/actions/types/${id}`, data);
}

/**
 * Publish an Action Type (DRAFT → PUBLISHED)
 */
export function publishActionType(id: number): Promise<ApiResponse<ActionTypeDTO>> {
  return post(`/core/api/v1/actions/types/${id}/publish`, {});
}

/**
 * Archive an Action Type (PUBLISHED → ARCHIVED)
 */
export function archiveActionType(id: number): Promise<ApiResponse<ActionTypeDTO>> {
  return post(`/core/api/v1/actions/types/${id}/archive`, {});
}

/**
 * Get Action Type by ID
 */
export function getActionType(id: number): Promise<ApiResponse<ActionTypeDTO>> {
  return get(`/core/api/v1/actions/types/${id}`);
}

/**
 * List Action Types with filtering
 */
export function listActionTypes(params: ListActionTypesRequest): Promise<ApiResponse<PageResult<ActionTypeDTO>>> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.name) queryParams.append('name', params.name);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sort) queryParams.append('sort', params.sort);

  const query = queryParams.toString();
  return get(`/core/api/v1/actions/types${query ? '?' + query : ''}`);
}

/**
 * Grant execution permission to user or role
 */
export function grantExecutionPermission(id: number, data: GrantPermissionRequest): Promise<ApiResponse<ActionTypeDTO>> {
  return post(`/core/api/v1/actions/types/${id}/permissions`, data);
}

/**
 * Revoke execution permission from user or role
 */
export function revokeExecutionPermission(id: number, type: PermissionType, permissionId: number): Promise<ApiResponse<void>> {
  return del(`/core/api/v1/actions/types/${id}/permissions?type=${type}&id=${permissionId}`);
}

// ---------------------------------------------------------------------------
// Action Execution APIs
// ---------------------------------------------------------------------------

/**
 * Execute an Action Type
 */
export function executeAction(data: ExecuteActionRequest): Promise<ApiResponse<ExecutionResultDTO>> {
  return post('/core/api/v1/actions/executions', data);
}

/**
 * Query execution history
 */
export function listExecutions(params: ListExecutionsRequest): Promise<ApiResponse<PageResult<ExecutionResultDTO>>> {
  const queryParams = new URLSearchParams();
  if (params.actionTypeId !== undefined) queryParams.append('actionTypeId', params.actionTypeId.toString());
  if (params.executorId !== undefined) queryParams.append('executorId', params.executorId.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sort) queryParams.append('sort', params.sort);

  const query = queryParams.toString();
  return get(`/core/api/v1/actions/executions${query ? '?' + query : ''}`);
}

/**
 * Get execution details by ID
 */
export function getExecutionDetail(id: number): Promise<ApiResponse<ExecutionResultDTO>> {
  return get(`/core/api/v1/actions/executions/${id}`);
}
