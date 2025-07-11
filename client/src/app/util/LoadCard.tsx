"use client";

import { Col, Flex, Row, Typography } from "antd";
import { getStatusColor } from "./statusColorLoads";
import { timeSincePosted } from "./timeSincePosted";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Load } from "../(main)/myloads/page";

interface LoadCardProps {
  load: Load;
}

const LoadCard: React.FC<LoadCardProps> = ({ load }) => {
  const { Text } = Typography;

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
            {/* {load.origin.state} */}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            - {load.origin.postalCode}
          </Typography.Text>
        </Col>

        <Col xs={24} md={4}>
          <Typography.Text className="labelStyle">Destination</Typography.Text>
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
            <EditOutlined className="icon-button" />
            <DeleteOutlined className="icon-button" />
          </Flex>
        </Col>
      </Row>
    </div>
  );
};
export default LoadCard;
