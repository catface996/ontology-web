import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb, Button, Input, Select, Typography, Flex, Spin, Table, Space, Form, Modal, message, Tag, Tabs, Descriptions,
} from 'antd';
import { ArrowLeft, Plus, Trash2, Save, Send, Archive, Edit2 } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { useHeader } from '../contexts/HeaderContext';
import {
  getActionType,
  createActionType,
  updateActionType,
  publishActionType,
  archiveActionType,
  listExecutions,
  type ActionTypeDTO,
  type ActionParameter,
  type ExecutionRule,
  type DataType,
  type RuleType,
  type ActionStatus,
  type ExecutionResultDTO,
} from '../services/actionService';

const statusConfig: Record<ActionStatus, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: 'Draft' },
  PUBLISHED: { color: 'success', label: 'Published' },
  ARCHIVED: { color: 'warning', label: 'Archived' },
};

/* -- Page -- */
export default function ActionTypePage() {
  const { actionTypeId } = useParams<{ actionTypeId: string }>();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { setBreadcrumbs, setActions } = useHeader();

  const isNew = actionTypeId === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<ActionTypeDTO | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<ActionParameter[]>([]);
  const [executionRules, setExecutionRules] = useState<ExecutionRule[]>([]);

  // Execution history
  const [executions, setExecutions] = useState<ExecutionResultDTO[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);

  // Modal state
  const [paramModalVisible, setParamModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  const [paramForm] = Form.useForm();
  const [ruleForm] = Form.useForm();

  const canEdit = isNew || actionType?.status === 'DRAFT';

  // Load action type
  useEffect(() => {
    if (!isNew && actionTypeId) {
      setLoading(true);
      getActionType(parseInt(actionTypeId))
        .then((res) => {
          if (res.data) {
            setActionType(res.data);
            setName(res.data.name);
            setDescription(res.data.description || '');
            setParameters(res.data.parameters || []);
            setExecutionRules(res.data.executionRules || []);
          }
        })
        .catch((error) => {
          message.error('Failed to load action type');
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, actionTypeId]);

  // Load execution history
  const loadExecutions = () => {
    if (!isNew && actionTypeId) {
      setExecutionsLoading(true);
      listExecutions({ actionTypeId: parseInt(actionTypeId), page: 0, size: 20, sort: 'executionTimestamp,desc' })
        .then((res) => {
          if (res.data) {
            setExecutions(res.data.content);
          }
        })
        .catch((error) => {
          console.error('Failed to load executions:', error);
        })
        .finally(() => setExecutionsLoading(false));
    }
  };

  // Breadcrumbs
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/actions')}>Actions</a> },
          { title: <Typography.Text strong>{isNew ? 'New Action' : name || 'Loading...'}</Typography.Text> },
        ]}
      />
    );
  }, [setBreadcrumbs, navigate, isNew, name]);

  // Header actions
  useEffect(() => {
    setActions(
      <Flex gap={8}>
        <Button icon={<ArrowLeft size={14} />} onClick={() => navigate('/actions')}>
          {!isMobile && 'Back'}
        </Button>
        {canEdit && (
          <Button type="primary" icon={<Save size={14} />} onClick={handleSave} loading={saving}>
            {!isMobile && 'Save'}
          </Button>
        )}
        {actionType?.status === 'DRAFT' && (
          <Button icon={<Send size={14} />} onClick={handlePublish}>
            {!isMobile && 'Publish'}
          </Button>
        )}
        {actionType?.status === 'PUBLISHED' && (
          <Button icon={<Archive size={14} />} onClick={handleArchive}>
            {!isMobile && 'Archive'}
          </Button>
        )}
      </Flex>
    );
    return () => setActions(null);
  }, [setActions, navigate, isMobile, canEdit, actionType, saving]);

  // Save handler
  const handleSave = async () => {
    if (!name.trim()) {
      message.error('Action name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        parameters,
        executionRules,
      };

      if (isNew) {
        const res = await createActionType(payload);
        message.success('Action type created successfully');
        navigate(`/actions/${res.data.id}`);
      } else {
        await updateActionType(parseInt(actionTypeId!), payload);
        message.success('Action type updated successfully');
        // Reload
        const res = await getActionType(parseInt(actionTypeId!));
        if (res.data) {
          setActionType(res.data);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to save action type');
    } finally {
      setSaving(false);
    }
  };

  // Publish handler
  const handlePublish = async () => {
    if (!actionType) return;
    Modal.confirm({
      title: 'Publish Action Type',
      content: 'Once published, this action type cannot be modified. Are you sure?',
      onOk: async () => {
        try {
          await publishActionType(actionType.id);
          message.success('Action type published successfully');
          const res = await getActionType(actionType.id);
          if (res.data) {
            setActionType(res.data);
          }
        } catch (error: any) {
          message.error(error.message || 'Failed to publish action type');
        }
      },
    });
  };

  // Archive handler
  const handleArchive = async () => {
    if (!actionType) return;
    Modal.confirm({
      title: 'Archive Action Type',
      content: 'This will prevent further executions. Are you sure?',
      onOk: async () => {
        try {
          await archiveActionType(actionType.id);
          message.success('Action type archived successfully');
          const res = await getActionType(actionType.id);
          if (res.data) {
            setActionType(res.data);
          }
        } catch (error: any) {
          message.error(error.message || 'Failed to archive action type');
        }
      },
    });
  };

  // Parameter handlers
  const handleAddParameter = () => {
    setEditingParamIndex(null);
    paramForm.resetFields();
    setParamModalVisible(true);
  };

  const handleEditParameter = (index: number) => {
    setEditingParamIndex(index);
    paramForm.setFieldsValue(parameters[index]);
    setParamModalVisible(true);
  };

  const handleDeleteParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParamModalOk = async () => {
    try {
      const values = await paramForm.validateFields();
      const newParam: ActionParameter = {
        ...values,
        displayOrder: editingParamIndex !== null ? parameters[editingParamIndex].displayOrder : parameters.length,
      };

      if (editingParamIndex !== null) {
        const updated = [...parameters];
        updated[editingParamIndex] = newParam;
        setParameters(updated);
      } else {
        setParameters([...parameters, newParam]);
      }
      setParamModalVisible(false);
    } catch (error) {
      // Validation failed
    }
  };

  // Rule handlers
  const handleAddRule = () => {
    setEditingRuleIndex(null);
    ruleForm.resetFields();
    setRuleModalVisible(true);
  };

  const handleEditRule = (index: number) => {
    setEditingRuleIndex(index);
    ruleForm.setFieldsValue(executionRules[index]);
    setRuleModalVisible(true);
  };

  const handleDeleteRule = (index: number) => {
    setExecutionRules(executionRules.filter((_, i) => i !== index));
  };

  const handleRuleModalOk = async () => {
    try {
      const values = await ruleForm.validateFields();
      const newRule: ExecutionRule = {
        ...values,
        adminOrder: editingRuleIndex !== null ? executionRules[editingRuleIndex].adminOrder : executionRules.length,
      };

      if (editingRuleIndex !== null) {
        const updated = [...executionRules];
        updated[editingRuleIndex] = newRule;
        setExecutionRules(updated);
      } else {
        setExecutionRules([...executionRules, newRule]);
      }
      setRuleModalVisible(false);
    } catch (error) {
      // Validation failed
    }
  };

  // Parameter columns
  const paramColumns = [
    {
      title: 'Name',
      dataIndex: 'parameterName',
      key: 'parameterName',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      render: (type: DataType) => <Tag>{type}</Tag>,
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      width: 100,
      render: (required: boolean) => <Tag color={required ? 'blue' : 'default'}>{required ? 'Yes' : 'No'}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    ...(canEdit
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, __: any, index: number) => (
              <Space>
                <Button size="small" icon={<Edit2 size={14} />} onClick={() => handleEditParameter(index)} />
                <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDeleteParameter(index)} />
              </Space>
            ),
          },
        ]
      : []),
  ];

  // Rule columns
  const ruleColumns = [
    {
      title: 'Order',
      dataIndex: 'adminOrder',
      key: 'adminOrder',
      width: 80,
    },
    {
      title: 'Type',
      dataIndex: 'ruleType',
      key: 'ruleType',
      width: 180,
      render: (type: RuleType) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: 'Target',
      key: 'target',
      width: 150,
      render: (_: any, record: ExecutionRule) => record.targetClass || record.targetRelationship || '-',
    },
    {
      title: 'Output ID',
      dataIndex: 'outputIdentifier',
      key: 'outputIdentifier',
      width: 120,
      render: (id: string) => id || '-',
    },
    ...(canEdit
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, __: any, index: number) => (
              <Space>
                <Button size="small" icon={<Edit2 size={14} />} onClick={() => handleEditRule(index)} />
                <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDeleteRule(index)} />
              </Space>
            ),
          },
        ]
      : []),
  ];

  // Execution columns
  const executionColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'SUCCESS' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: 'Execution Time',
      dataIndex: 'executionTimestamp',
      key: 'executionTimestamp',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Executor',
      dataIndex: 'executorName',
      key: 'executorName',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: 'Duration',
      dataIndex: 'durationMs',
      key: 'durationMs',
      width: 100,
      render: (ms: number) => `${ms}ms`,
    },
    {
      title: 'Error',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true,
      render: (error: string) => error || '-',
    },
  ];

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Information',
      children: (
        <div>
          <Form layout="vertical">
            <Form.Item label="Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter action type name"
                disabled={!canEdit}
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
                disabled={!canEdit}
              />
            </Form.Item>
          </Form>
          {actionType && (
            <Descriptions bordered size="small" column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Status">
                <Tag color={statusConfig[actionType.status].color}>{statusConfig[actionType.status].label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {actionType.createdAt ? new Date(actionType.createdAt).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Modified At">
                {actionType.modifiedAt ? new Date(actionType.modifiedAt).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Published At">
                {actionType.publishedAt ? new Date(actionType.publishedAt).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
      ),
    },
    {
      key: 'parameters',
      label: 'Parameters',
      children: (
        <div>
          {canEdit && (
            <Button
              type="primary"
              icon={<Plus size={14} />}
              onClick={handleAddParameter}
              style={{ marginBottom: 16 }}
            >
              Add Parameter
            </Button>
          )}
          <Table
            dataSource={parameters}
            columns={paramColumns}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: 'rules',
      label: 'Execution Rules',
      children: (
        <div>
          {canEdit && (
            <Button
              type="primary"
              icon={<Plus size={14} />}
              onClick={handleAddRule}
              style={{ marginBottom: 16 }}
            >
              Add Rule
            </Button>
          )}
          <Table
            dataSource={executionRules}
            columns={ruleColumns}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: 'history',
      label: 'Execution History',
      children: (
        <div>
          <Button
            onClick={loadExecutions}
            loading={executionsLoading}
            style={{ marginBottom: 16 }}
          >
            Refresh
          </Button>
          <Table
            dataSource={executions}
            columns={executionColumns}
            rowKey="executionId"
            pagination={false}
            size="small"
            loading={executionsLoading}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? 12 : 24, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {isNew ? 'New Action Type' : name}
        </Typography.Title>
      </Flex>

      {/* Tabs */}
      <Tabs items={tabItems} />

      {/* Parameter Modal */}
      <Modal
        title={editingParamIndex !== null ? 'Edit Parameter' : 'Add Parameter'}
        open={paramModalVisible}
        onOk={handleParamModalOk}
        onCancel={() => setParamModalVisible(false)}
        width={600}
      >
        <Form form={paramForm} layout="vertical">
          <Form.Item
            name="parameterName"
            label="Parameter Name"
            rules={[
              { required: true, message: 'Required' },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: 'Must start with letter, only alphanumeric and underscore' },
            ]}
          >
            <Input placeholder="e.g., projectName" />
          </Form.Item>
          <Form.Item name="dataType" label="Data Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'String', value: 'STRING' },
                { label: 'Number', value: 'NUMBER' },
                { label: 'Boolean', value: 'BOOLEAN' },
                { label: 'Date', value: 'DATE' },
                { label: 'Entity Reference', value: 'ENTITY_REFERENCE' },
              ]}
            />
          </Form.Item>
          <Form.Item name="required" label="Required" valuePropName="checked" initialValue={false}>
            <Select options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Rule Modal */}
      <Modal
        title={editingRuleIndex !== null ? 'Edit Rule' : 'Add Rule'}
        open={ruleModalVisible}
        onOk={handleRuleModalOk}
        onCancel={() => setRuleModalVisible(false)}
        width={600}
      >
        <Form form={ruleForm} layout="vertical">
          <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Create Instance', value: 'CREATE_INSTANCE' },
                { label: 'Modify Instance', value: 'MODIFY_INSTANCE' },
                { label: 'Delete Instance', value: 'DELETE_INSTANCE' },
                { label: 'Create Relationship', value: 'CREATE_RELATIONSHIP' },
                { label: 'Remove Relationship', value: 'REMOVE_RELATIONSHIP' },
              ]}
            />
          </Form.Item>
          <Form.Item name="targetClass" label="Target Class">
            <Input placeholder="e.g., Project (for instance operations)" />
          </Form.Item>
          <Form.Item name="targetRelationship" label="Target Relationship">
            <Input placeholder="e.g., hasMember (for relationship operations)" />
          </Form.Item>
          <Form.Item name="outputIdentifier" label="Output Identifier">
            <Input placeholder="Optional identifier for referencing in later rules" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
