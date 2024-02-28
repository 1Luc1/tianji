import { Trans, t } from '@i18next-toolkit/react';
import { Button, Form, Input, Modal, Table } from 'antd';
import React, { useMemo, useState } from 'react';
import { AppRouterOutput, trpc } from '../../api/trpc';
import { useCurrentWorkspaceId } from '../../store/user';
import { type ColumnsType } from 'antd/es/table/interface';
import {
  BarChartOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { PageHeader } from '../PageHeader';
import { useEvent } from '../../hooks/useEvent';
import { TelemetryCounter } from './TelemetryCounter';

type TelemetryInfo = AppRouterOutput['telemetry']['all'][number];

export const TelemetryList: React.FC = React.memo(() => {
  const workspaceId = useCurrentWorkspaceId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<{ id?: string; name: string }>();
  const upsertTelemetryMutation = trpc.telemetry.upsert.useMutation();
  const utils = trpc.useUtils();

  const handleAddTelemetry = useEvent(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    await upsertTelemetryMutation.mutateAsync({
      telemetryId: values.id,
      workspaceId,
      name: values.name,
    });

    utils.telemetry.all.refetch();

    setIsModalOpen(false);

    form.resetFields();
  });

  const handleEditTelemetry = useEvent(async (info: TelemetryInfo) => {
    setIsModalOpen(true);
    form.setFieldsValue({
      id: info.id,
      name: info.name,
    });
  });

  return (
    <div>
      <PageHeader
        title={t('Telemetry')}
        desc={
          <div>
            <p>
              <Trans>
                Telemetry is a technology that reports access data even on pages
                that are not under your control. As long as the other website
                allows the insertion of third-party images (e.g., forums, blogs,
                and various rich-text editors), then the data can be collected
                and used to analyze the images when they are loaded by the user.
              </Trans>
            </p>

            <p>
              <Trans>
                Generally, we will use a one-pixel blank image so that it will
                not affect the user's normal use.
              </Trans>
            </p>

            <p>
              <Trans>
                At the same time, we can also use it in some client-side
                application scenarios, such as collecting the frequency of cli
                usage, such as collecting the installation of selfhosted apps,
                and so on.
              </Trans>
            </p>
          </div>
        }
        action={
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsModalOpen(true)}
            >
              {t('Add Telemetry')}
            </Button>
          </div>
        }
      />

      <TelemetryListTable onEdit={handleEditTelemetry} />

      <Modal
        title={t('Add Telemetry')}
        open={isModalOpen}
        okButtonProps={{
          loading: upsertTelemetryMutation.isLoading,
        }}
        onOk={() => handleAddTelemetry()}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="id" hidden={true} />
          <Form.Item
            label={t('Telemetry Name')}
            name="name"
            tooltip={t('Telemetry Name to Display')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});
TelemetryList.displayName = 'TelemetryList';

const TelemetryListTable: React.FC<{
  onEdit: (info: TelemetryInfo) => void;
}> = React.memo((props) => {
  const workspaceId = useCurrentWorkspaceId();
  const { data = [], isLoading } = trpc.telemetry.all.useQuery({
    workspaceId,
  });
  const navigate = useNavigate();

  const columns = useMemo((): ColumnsType<TelemetryInfo> => {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        dataIndex: 'id',
        title: t('Count'),
        align: 'center',
        width: 130,
        render: (id) => {
          return <TelemetryCounter telemetryId={id} />;
        },
      },
      {
        key: 'action',
        title: t('Actions'),
        align: 'right',
        width: 240,
        render: (_, record) => {
          return (
            <div className="flex gap-2 justify-end">
              <Button
                icon={<EditOutlined />}
                onClick={() => props.onEdit(record)}
              >
                {t('Edit')}
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => {
                  navigate(`/telemetry/${record.id}`);
                }}
              >
                {t('View')}
              </Button>
            </div>
          );
        },
      },
    ] as ColumnsType<TelemetryInfo>;
  }, []);

  return (
    <Table
      loading={isLoading}
      dataSource={data}
      columns={columns}
      rowKey="id"
    />
  );
});
TelemetryListTable.displayName = 'TelemetryListTable';
