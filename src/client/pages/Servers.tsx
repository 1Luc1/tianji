import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { ServerStatusInfo } from '../../types';
import { useSocketSubscribe } from '../api/socketio';
import { filesize } from 'filesize';
import prettyMilliseconds from 'pretty-ms';

export const Servers: React.FC = React.memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="h-24 flex items-center">
        <div className="text-2xl flex-1">Servers</div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Add Server
          </Button>
        </div>
      </div>

      <ServerList />

      <Modal
        title="Add Server"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Server Name">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});
Servers.displayName = 'Servers';

interface ServerInfoRecordType {
  status: 'online' | 'offline';
  nodeName: string;
  type: string; // KVM | Hyper-V
  location: string;
  uptime: number; // second
  load: number;
  network: string;
  traffic: string;
  cpu: string;
  ram: string;
  hdd: string;
}

export const ServerList: React.FC = React.memo(() => {
  const serverMap = useSocketSubscribe<Record<string, ServerStatusInfo>>(
    'onServerStatusUpdate',
    {}
  );

  const dataSource = Object.values(serverMap);

  console.log('dataSource', dataSource);

  const columns = useMemo((): ColumnsType<ServerStatusInfo> => {
    return [
      {
        key: 'status',
        title: 'Status',
        render: (val, record) => {
          return Date.now() - (record.updatedAt + record.timeout) < 0
            ? 'online'
            : 'offline';
        },
      },
      {
        dataIndex: 'name',
        title: 'Node Name',
      },
      {
        dataIndex: 'hostname',
        title: 'Host Name',
      },
      {
        dataIndex: ['payload', 'system'],
        title: 'System',
      },
      {
        dataIndex: ['payload', 'uptime'],
        title: 'Uptime',
        render: (val) => prettyMilliseconds(Number(val) * 1000),
      },
      {
        dataIndex: ['payload', 'load'],
        title: 'Load',
      },
      {
        key: 'nework',
        title: 'Network',
        render: (_, record) => {
          return `${filesize(record.payload.network_in)} | ${filesize(
            record.payload.network_out
          )}`;
        },
      },
      {
        key: 'traffic',
        title: 'Traffic',
        render: (_, record) => {
          return `${filesize(record.payload.network_rx)}/s | ${filesize(
            record.payload.network_tx
          )}/s`;
        },
      },
      {
        dataIndex: ['payload', 'cpu'],
        title: 'cpu',
        render: (val) => `${val}%`,
      },
      {
        key: 'ram',
        title: 'ram',
        render: (_, record) => {
          return `${filesize(record.payload.memory_used * 1000)} / ${filesize(
            record.payload.memory_total * 1000
          )}`;
        },
      },
      {
        key: 'hdd',
        title: 'hdd',
        render: (_, record) => {
          return `${filesize(record.payload.hdd_used * 1000)} / ${filesize(
            record.payload.hdd_total * 1000
          )}`;
        },
      },
    ];
  }, []);

  return (
    <Table
      rowKey="hostname"
      columns={columns}
      dataSource={dataSource}
      pagination={false}
    />
  );
});
ServerList.displayName = 'ServerList';
