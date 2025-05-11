"use client";

import { Button, Card, Col, Flex, Row, Typography, Space } from "antd";
import { getStatusColor } from "./statusColorLoads";
import { timeSincePosted } from "./timeSincePosted";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

type LoadStatus =
  | "AVAILABLE"
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

interface Location {
  city: string;
  state: string;
  postalCode: string;
}
interface Load {
  id: string;
  origin: Location;
  destination: Location;
  specialRequirements: string;
  cargoType: string;
  trucks: number;
  pickupWindowStart: string;
  deliveryWindowEnd: string;
  status: LoadStatus;
  createdAt: string;
}

export default function LoadCard({ load }: any) {
  const { Text } = Typography;
  const labelStyle = { fontWeight: 500, fontSize: 13, color: "#888" };
  const valueStyle = { fontWeight: 600, fontSize: 14, color: "#000" };
  const formatDateTime = (str: string) =>
    new Date(str).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const router = useRouter();
  return (
    <Card
      key={load.id}
      styles={{ body: { padding: 20 } }}
      style={{
        borderRadius: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}
    >
      <div className="col-span-2 md:col-span-2">
        <div className="-mt-1">
          <Text
            className={`${getStatusColor(
              load.status
            )} p-1 px-2 text-sm rounded-l-md`}
          >
            {load.status}
          </Text>
          <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">
            {timeSincePosted(load.createdAt)}
          </Text>
        </div>
      </div>
      <Row gutter={[16, 12]} align="middle" justify="space-between">
        <Col xs={24} md={5}>
          <Space direction="vertical" size={2}>
            <Typography.Text style={labelStyle}>Origin</Typography.Text>
            <Typography.Text style={valueStyle}>
              {load.origin.city}, {load.origin.state}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {load.origin.postalCode}
            </Typography.Text>
          </Space>
        </Col>

        <Col xs={24} md={5}>
          <Space direction="vertical" size={2}>
            <Typography.Text style={labelStyle}>Destination</Typography.Text>
            <Typography.Text style={valueStyle}>
              {load.destination.city}, {load.destination.state}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {load.destination.postalCode}
            </Typography.Text>
          </Space>
        </Col>

        <Col xs={12} md={3}>
          <Typography.Text style={labelStyle}>Equipment</Typography.Text>
          <br />
          <Typography.Text style={valueStyle}>
            {load.specialRequirements}
          </Typography.Text>
        </Col>

        <Col xs={12} md={2}>
          <Typography.Text style={labelStyle}>Cargo Type</Typography.Text>
          <br />
          <Typography.Text style={valueStyle}>{load.cargoType}</Typography.Text>
        </Col>

        <Col xs={12} md={3}>
          <Typography.Text style={labelStyle}>Pickup</Typography.Text>
          <br />
          <Typography.Text style={valueStyle}>
            {formatDateTime(load.pickupWindowStart)}
          </Typography.Text>
        </Col>

        <Col xs={12} md={2}>
          <Typography.Text style={labelStyle}>Delivery</Typography.Text>
          <br />
          <Typography.Text style={valueStyle}>
            {formatDateTime(load.deliveryWindowEnd)}
          </Typography.Text>
        </Col>

        <Col xs={24} md={2}>
          <Flex align="center" gap={8}>
            <Button
              icon={<EyeOutlined />}
              className="button-primary max-h-10"
              style={{
                borderRadius: 6,
                width: "100%",
              }}
              onClick={() => router.push(`/myloads/${load.id}`)}
            >
              View
            </Button>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
}
