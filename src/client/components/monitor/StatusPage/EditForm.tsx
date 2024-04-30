import { Switch, Divider, Form, Input, Typography } from 'antd';
import React from 'react';
import { MonitorPicker } from '../MonitorPicker';
import { domainValidator, urlSlugValidator } from '../../../utils/validator';
import { useTranslation } from '@i18next-toolkit/react';
import { Button } from '@/components/ui/button';
import { LuMinusCircle, LuPlus } from 'react-icons/lu';
import { MarkdownEditor } from '@/components/MarkdownEditor';

const { Text } = Typography;

export interface MonitorStatusPageEditFormValues {
  title: string;
  slug: string;
  description: string;
  monitorList: PrismaJson.MonitorStatusPageList;
  domain: string;
}

interface MonitorStatusPageEditFormProps {
  isLoading?: boolean;
  initialValues?: Partial<MonitorStatusPageEditFormValues>;
  onFinish: (values: MonitorStatusPageEditFormValues) => void;
  onCancel?: () => void;
  saveButtonLabel?: string;
}

export const MonitorStatusPageEditForm: React.FC<MonitorStatusPageEditFormProps> =
  React.memo((props) => {
    const { t } = useTranslation();

    return (
      <div>
        <Form<MonitorStatusPageEditFormValues>
          layout="vertical"
          initialValues={props.initialValues}
          onFinish={props.onFinish}
        >
          <Form.Item
            label={t('Title')}
            name="title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            extra={
              <div className="pt-2">
                <div>
                  {t('Accept characters')}: <Text code>a-z</Text>{' '}
                  <Text code>0-9</Text> <Text code>-</Text>
                </div>
                <div>
                  {t('No consecutive dashes')} <Text code>--</Text>
                </div>
              </div>
            }
            rules={[
              {
                required: true,
              },
              {
                validator: urlSlugValidator,
              },
            ]}
          >
            <Input addonBefore={`${window.origin}/status/`} />
          </Form.Item>

          <Form.Item label={t('Description')} name="description">
            <MarkdownEditor value={''} />
          </Form.Item>

          <Form.Item
            label={t('Custom Domain')}
            name="domain"
            extra={
              <div>
                {t(
                  'You can config your status page in your own domain, for example: status.example.com'
                )}
              </div>
            }
            rules={[
              {
                validator: domainValidator,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.List name="monitorList">
            {(fields, { add, remove }, { errors }) => {
              return (
                <>
                  <Form.Item label={t('Monitors')}>
                    <div className="mb-2 flex flex-col gap-2">
                      {fields.map((field, index) => (
                        // monitor item
                        <>
                          {index !== 0 && <Divider className="my-0.5" />}

                          <div key={field.key} className="flex flex-col gap-1">
                            <Form.Item
                              name={[field.name, 'id']}
                              rules={[
                                {
                                  required: true,
                                  message: t('Please select monitor'),
                                },
                              ]}
                              noStyle={true}
                            >
                              <MonitorPicker />
                            </Form.Item>

                            <div className="item-center flex">
                              <div className="flex flex-1 items-center">
                                <Form.Item
                                  name={[field.name, 'showCurrent']}
                                  valuePropName="checked"
                                  noStyle={true}
                                >
                                  <Switch size="small" />
                                </Form.Item>

                                <span className="ml-1 align-middle text-sm">
                                  {t('Show Current Response')}
                                </span>
                              </div>

                              <LuMinusCircle
                                className="mt-1.5 cursor-pointer text-lg"
                                onClick={() => remove(field.name)}
                              />
                            </div>
                          </div>
                        </>
                      ))}
                    </div>

                    <Button
                      variant="dashed"
                      onClick={() => add()}
                      style={{ width: '60%' }}
                      Icon={LuPlus}
                    >
                      {t('Add Monitor')}
                    </Button>

                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              );
            }}
          </Form.List>

          <div className="flex gap-4">
            <Button type="submit" loading={props.isLoading}>
              {props.saveButtonLabel ?? t('Save')}
            </Button>

            {props.onCancel && (
              <Button variant="outline" type="button" onClick={props.onCancel}>
                {t('Cancel')}
              </Button>
            )}
          </div>
        </Form>
      </div>
    );
  });
MonitorStatusPageEditForm.displayName = 'MonitorStatusPageEditForm';
