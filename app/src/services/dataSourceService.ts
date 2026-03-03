import { post, type ApiResponse } from '../utils/request';
import type {
  DataSourceDTO,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  FieldMappingDTO,
  SaveMappingsRequest,
  ListMappingsRequest,
  FieldMappingConfigDTO,
  ListFieldMappingConfigRequest,
  SaveFieldMappingConfigRequest,
  PageFieldMappingConfigRequest,
  PageResult,
} from '../types/datasource';

// ---------------------------------------------------------------------------
// Data Source APIs
// ---------------------------------------------------------------------------

export async function listDataSources(params: { ontologyId: number; keyword?: string; status?: string }): Promise<ApiResponse<DataSourceDTO[]>> {
  const res = await post<DataSourceDTO[]>('/core/api/v1/datasource/list', params);
  if (res.data) {
    for (const ds of res.data) {
      if (typeof ds.schemaJson === 'string') {
        try { ds.schemaJson = JSON.parse(ds.schemaJson); } catch { ds.schemaJson = undefined; }
      }
    }
  }
  return res;
}

export async function getDataSource(id: number): Promise<ApiResponse<DataSourceDTO>> {
  const res = await post<DataSourceDTO>('/core/api/v1/datasource/get', { id });
  if (res.data && typeof res.data.schemaJson === 'string') {
    try {
      res.data.schemaJson = JSON.parse(res.data.schemaJson);
    } catch {
      res.data.schemaJson = undefined;
    }
  }
  return res;
}

export function createDataSource(params: CreateDataSourceRequest): Promise<ApiResponse<DataSourceDTO>> {
  return post<DataSourceDTO>('/core/api/v1/datasource/create', params);
}

export function updateDataSource(params: UpdateDataSourceRequest): Promise<ApiResponse<DataSourceDTO>> {
  return post<DataSourceDTO>('/core/api/v1/datasource/update', params);
}

export function deleteDataSource(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/datasource/delete', { id });
}

export function updateDataSourceStatus(params: { id: number; status: string; errorMessage?: string }): Promise<ApiResponse<{ id: number; status: string; lastTestedAt: string }>> {
  return post('/core/api/v1/datasource/update-status', params);
}

export function saveSchema(params: { id: number; schemaJson: object }): Promise<ApiResponse<{ id: number; schemaDiscoveredAt: string }>> {
  return post('/core/api/v1/datasource/schema/save', params);
}

// ---------------------------------------------------------------------------
// Field Mapping APIs
// ---------------------------------------------------------------------------

export function listMappings(params: ListMappingsRequest): Promise<ApiResponse<FieldMappingDTO[]>> {
  return post<FieldMappingDTO[]>('/core/api/v1/datasource/mapping/list', params);
}

export function saveMappings(params: SaveMappingsRequest): Promise<ApiResponse<{ savedCount: number }>> {
  return post('/core/api/v1/datasource/mapping/save', params);
}

export function deleteMapping(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/datasource/mapping/delete', { id });
}

export function deleteMappingsBatch(params: { dataSourceId: number; sourceTable?: string; targetClassId?: number }): Promise<ApiResponse<{ deletedCount: number }>> {
  return post('/core/api/v1/datasource/mapping/delete-batch', params);
}

// ---------------------------------------------------------------------------
// New Field Mapping Config APIs (table+class granularity, JSON storage)
// ---------------------------------------------------------------------------

export function listMappingConfigs(params: ListFieldMappingConfigRequest): Promise<ApiResponse<FieldMappingConfigDTO[]>> {
  return post<FieldMappingConfigDTO[]>('/core/api/v1/datasource/mapping/config/list', params);
}

export function saveMappingConfig(params: SaveFieldMappingConfigRequest): Promise<ApiResponse<FieldMappingConfigDTO>> {
  return post<FieldMappingConfigDTO>('/core/api/v1/datasource/mapping/config/save', params);
}

export function deleteMappingConfig(id: number): Promise<ApiResponse<null>> {
  return post<null>('/core/api/v1/datasource/mapping/config/delete', { id });
}

export function pageMappingConfigs(params: PageFieldMappingConfigRequest): Promise<ApiResponse<PageResult<FieldMappingConfigDTO>>> {
  return post<PageResult<FieldMappingConfigDTO>>('/core/api/v1/datasource/mapping/config/page', params);
}
