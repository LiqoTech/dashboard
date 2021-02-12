import React, { useState } from 'react';
import {
  Row,
  Col,
  Popconfirm,
  Alert,
  Space,
  Button,
  Typography,
  Tooltip,
  message
} from 'antd';
import {
  ExclamationCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import ResourceBreadcrumb from '../common/ResourceBreadcrumb';
import FavouriteButton from '../common/buttons/FavouriteButton';
import UpdateCR from '../../editors/CRD/UpdateCR';
import CustomViewButton from '../common/buttons/CustomViewButton';

function ResourceHeader(props) {
  const [deleting, setDeleting] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  /** Delete the Resource */
  const handleClick_delete = () => {
    let promise = props.deleteFunc(
      props.resource.metadata.name,
      props.resource.metadata.namespace
    );

    promise
      .then(() => {
        props.deleted.current = true;
        setDeleting(true);
        message.success(props.kind + ' terminating...');
      })
      .catch(() => {
        message.error('Could not delete the ' + props.kind);
      });
  };

  return (
    <Alert.ErrorBoundary>
      <div
        className={'resource-header'}
        style={{ width: '100%', paddingBottom: 16, paddingTop: 20 }}
      >
        <Row align={'bottom'}>
          <Col span={20}>
            <Row align={'bottom'}>
              <Col>
                <ResourceBreadcrumb />
              </Col>
              <Col>
                <Tooltip title={props.resource.metadata.name} placement={'top'}>
                  <Typography.Title level={3} style={{ marginBottom: 0 }}>
                    {props.altName ? props.altName : props.name}
                  </Typography.Title>
                </Tooltip>
              </Col>
              <Col>
                {deleting ? (
                  <div>
                    <Typography.Text
                      type={'secondary'}
                      style={{ marginLeft: 10, marginRight: 5 }}
                    >
                      (terminating
                    </Typography.Text>
                    <LoadingOutlined />)
                  </div>
                ) : null}
              </Col>
              <Col>
                <span style={{ marginLeft: 10 }}>
                  <FavouriteButton
                    resourceName={props.resource.metadata.name}
                    favourite={
                      props.resource.metadata.annotations &&
                      props.resource.metadata.annotations.favourite
                        ? 1
                        : 0
                    }
                    resourceList={[props.resource]}
                  />
                </span>
              </Col>
            </Row>
          </Col>
          <Col span={4}>
            <div style={{ float: 'right' }}>
              <Space align={'center'}>
                <CustomViewButton resource={props.resource} />
                {props.onCustomResource ? (
                  <div>
                    <Button
                      icon={<EditOutlined />}
                      type={'primary'}
                      onClick={() => setShowUpdate(true)}
                    >
                      EDIT
                    </Button>
                    <UpdateCR
                      CR={props.resource}
                      CRD={props.onCustomResource}
                      setShowUpdate={setShowUpdate}
                      showUpdate={showUpdate}
                    />
                  </div>
                ) : null}
                <Popconfirm
                  placement="topRight"
                  title="Are you sure?"
                  icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={handleClick_delete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />}>
                    DELETE
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </Alert.ErrorBoundary>
  );
}

export default ResourceHeader;
