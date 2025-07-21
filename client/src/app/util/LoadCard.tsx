"use client";

import {
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  DatePicker,
  Button,
  message,
  Select,
} from "antd";

import { getStatusColor } from "./statusColorLoads";
import { timeSincePosted } from "./timeSincePosted";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Load } from "../(main)/myloads/page";
import React, { useState } from "react";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import {
  deleteLoadByLoadId,
  getLoadByLoadId,
  updateLoadByLoadId,
} from "@/state/api";

interface LoadCardProps {
  load: Load;
}

type LoadFormValues = {
  pickup: Dayjs;
  delivery: Dayjs;
  status: string;
};

type UpdatedLoadFields = {
  loadId: string;
  pickupWindowStart: string;
  deliveryWindowEnd: string;
  status: string;
};

const LoadCard: React.FC<LoadCardProps> = ({ load }) => {
  const { Text } = Typography;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const formatDateTime = (str: string) =>
    new Date(str).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleEditClick = () => {
    form.setFieldsValue({
      originCity: load.origin.city,
      destinationCity: load.destination.city,
      cargoType: load.cargoType,
      pickup: dayjs(load.pickupWindowStart),
      delivery: dayjs(load.deliveryWindowEnd),
      status: load.status,
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (values: LoadFormValues) => {
    const updatedFields: UpdatedLoadFields = {
      loadId: load.id,
      pickupWindowStart: values.pickup.toISOString(),
      deliveryWindowEnd: values.delivery.toISOString(),
      status: values.status,
    };

    try {
      const update = await updateLoadByLoadId(updatedFields);
      if (update?.id) {
        message.success("Load updated successfully");
      } else {
        message.error("Something went wrong, please try again");
      }
    } catch (error: unknown) {
      console.error("Update error:", error);
      message.error("Something went wrong, please try again");
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this load?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const deleteLoad = await deleteLoadByLoadId({
            loadId: load.id,
          });
          if (deleteLoad.message === "success") {
            message.success("Load deleted successfully");
            router.refresh();
          } else {
            message.error("Load deleted failed");
          }
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete the load. Please try again.");
        }
      },
    });
  };

  return (
    <>
      <div key={load.id} className="box">
        <div className="col-span-2 md:col-span-2">
          <div className="-mt-1">
            <Text
              className={`${getStatusColor(
                load.status
              )} p-1 px-2 text-sm rounded-md mr-2`}
            >
              {load.status}
            </Text>
            <Text className="bg-gray-200 p-1 px-2 text-sm rounded-md">
              {timeSincePosted(load.createdAt)}
            </Text>
          </div>
        </div>
        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col xs={24} md={4}>
            <Typography.Text className="labelStyle">Origin</Typography.Text>
            <br />
            <Typography.Text className="valueStyle">
              {load.origin.city}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              - {load.origin.postalCode}
            </Typography.Text>
          </Col>

          <Col xs={24} md={4}>
            <Typography.Text className="labelStyle">
              Destination
            </Typography.Text>
            <br />
            <Typography.Text className="valueStyle">
              {load.destination.city}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              - {load.destination.postalCode}
            </Typography.Text>
          </Col>

          <Col xs={12} md={2}>
            <Typography.Text className="labelStyle">Cargo Type</Typography.Text>
            <br />
            <Typography.Text className="valueStyle">
              {load.cargoType}
            </Typography.Text>
          </Col>

          <Col xs={12} md={3}>
            <Typography.Text className="labelStyle">Pickup</Typography.Text>
            <br />
            <Typography.Text className="valueStyle">
              {formatDateTime(load.pickupWindowStart)}
            </Typography.Text>
          </Col>

          <Col xs={12} md={2}>
            <Typography.Text className="labelStyle">Delivery</Typography.Text>
            <br />
            <Typography.Text className="valueStyle">
              {formatDateTime(load.deliveryWindowEnd)}
            </Typography.Text>
          </Col>

          <Col xs={24} md={3}>
            <Flex align="center" gap={8}>
              <EyeOutlined
                onClick={() => router.push(`/myloads/${load.id}`)}
                className="icon-button"
              />
              <EditOutlined
                className="icon-button"
                onClick={async () => {
                  const thisLoad = await getLoadByLoadId(load.id);
                  if (thisLoad.status === "AVAILABLE") {
                    handleEditClick();
                  } else if (thisLoad.status === "ASSIGNED") {
                    message.error(
                      "already load assigned to driver,you cant modify the load"
                    );
                  } else if (thisLoad.status === "CANCELLED") {
                    message.error(
                      "already you cancelled the load , you cant modify again"
                    );
                  }
                }}
              />
              <DeleteOutlined
                className="icon-button"
                onClick={async () => {
                  const thisLoad = await getLoadByLoadId(load.id);
                  if (thisLoad.status === "AVAILABLE") {
                    handleDeleteClick();
                  } else if (thisLoad.status === "ASSIGNED") {
                    message.error(
                      "already load assigned to driver,you cant modify the load"
                    );
                  } else if (thisLoad.status === "CANCELLED") {
                    message.error(
                      "already you cancelled the load , you cant modify again"
                    );
                  }
                }}
              />
            </Flex>
          </Col>
        </Row>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Pickup, Delivery & Status"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item label="Origin City" name="originCity">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Destination City" name="destinationCity">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Cargo Type" name="cargoType">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Pickup Window"
            name="pickup"
            rules={[{ required: true, message: "Pickup time required" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Delivery Window"
            name="delivery"
            rules={[{ required: true, message: "Delivery time required" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select>
              <Select.Option value="AVAILABLE">AVAILABLE</Select.Option>
              <Select.Option value="CANCELLED">CANCELLED</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LoadCard;
