"use client";

import { Button, Card, Col, Flex, Row, Typography, Space } from "antd";
import { getStatusColor } from "./statusColorLoads";
import { timeSincePosted } from "./timeSincePosted";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

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
    <Card key={load.id} className="!mb-2" >
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
            <Typography.Text style={labelStyle}>Origin</Typography.Text><br/>
            <Typography.Text style={valueStyle}>
              {load.origin.city}
              {/* {load.origin.state} */}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {load.origin.postalCode}
            </Typography.Text>
        </Col>

        <Col xs={24} md={4}>

            <Typography.Text style={labelStyle}>Destination</Typography.Text><br/>
            <Typography.Text style={valueStyle}>
              {load.destination.city}
               {/* {load.destination.state} */}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                - {load.destination.postalCode}
            </Typography.Text>

        </Col>
{/* 
        <Col xs={12} md={3}>
          <Typography.Text style={labelStyle}>Equipment</Typography.Text>
          <br />
          <Typography.Text style={valueStyle}>
            {load.specialRequirements}
          </Typography.Text>
        </Col> */}

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

        <Col xs={24} md={3}>
          <Flex align="center" gap={8}>
          <EyeOutlined onClick={() => router.push(`/myloads/${load.id}`)} className="icon-button"/>
            <EditOutlined  className="icon-button" />
            <DeleteOutlined className="icon-button" />
          </Flex>
        </Col>
      </Row>
    </Card>
  );
}
