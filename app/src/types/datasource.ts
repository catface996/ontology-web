export type DataSourceSubtype = 'postgresql' | 'mysql';
export type DataSourceStatus = 'NOT_TESTED' | 'CONNECTED' | 'ERROR';
export type TransformType = 'DIRECT' | 'UPPERCASE' | 'LOWERCASE' | 'TRIM' | 'CUSTOM';

export interface ColumnSchema {
  columnName: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  ordinalPosition: number;
}

export interface TableSchema {
  tableName: string;
  schemaName?: string;
  tableType?: string;
  rowCount?: number;
  columns: ColumnSchema[];
}

export interface SchemaJson {
  tables: TableSchema[];
}

export interface DataSourceDTO {
  id: number;
  ontologyId: number;
  name: string;
  type: string;
  subtype: DataSourceSubtype;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  status: DataSourceStatus;
  lastTestedAt?: string;
  lastErrorMessage?: string;
  schemaJson?: SchemaJson;
  schemaDiscoveredAt?: string;
  brandColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataSourceRequest {
  ontologyId: number;
  name: string;
  subtype: DataSourceSubtype;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  brandColor?: string;
}

export interface UpdateDataSourceRequest {
  id: number;
  name?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  brandColor?: string;
}

export interface FieldMappingDTO {
  id: number;
  dataSourceId: number;
  sourceTable: string;
  sourceColumn: string;
  sourceColumnType?: string;
  targetClassId: number;
  targetClassName?: string;
  targetPropertyId: number;
  targetPropertyName?: string;
  targetPropertyType?: string;
  transformType: TransformType;
  customExpression?: string;
}

export interface SaveMappingItem {
  sourceTable: string;
  sourceColumn: string;
  sourceColumnType?: string;
  targetClassId: number;
  targetPropertyId: number;
  transformType: TransformType;
  customExpression?: string;
}

export interface SaveMappingsRequest {
  dataSourceId: number;
  mappings: SaveMappingItem[];
}

export interface ListMappingsRequest {
  dataSourceId: number;
  sourceTable?: string;
  targetClassId?: number;
}

// ==================== New FieldMappingConfig Types ====================

export interface ColumnMappingItem {
  sourceColumn: string;
  sourceColumnType?: string;
  targetPropertyId: number;
  targetPropertyName?: string;
  targetPropertyType?: string;
  transformType: TransformType;
  customExpression?: string;
}

export interface FieldMappingConfigDTO {
  id: number;
  dataSourceId: number;
  dataSourceName?: string;
  sourceTable: string;
  targetClassId: number;
  targetClassName?: string;
  mappingCount?: number;
  hasTypeWarning?: boolean;
  mappings: ColumnMappingItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ListFieldMappingConfigRequest {
  dataSourceId: number;
  sourceTable?: string;
  targetClassId?: number;
}

export interface SaveFieldMappingConfigRequest {
  dataSourceId: number;
  sourceTable: string;
  targetClassId: number;
  mappings: Array<{
    sourceColumn: string;
    sourceColumnType?: string;
    targetPropertyId: number;
    transformType: TransformType;
    customExpression?: string;
  }>;
}

export interface DeleteFieldMappingConfigRequest {
  id: number;
}

// ==================== Pagination Types ====================

export interface PageResult<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

export interface PageFieldMappingConfigRequest {
  dataSourceId?: number;
  targetClassId?: number;
  page?: number;
  pageSize?: number;
}
