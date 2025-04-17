"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { getLoadsById } from "@/state/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Flex,
  Button,
  Space,
  Divider,
  Select,
  Tag,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Option } = Select;

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
}

const statusColors: Record<LoadStatus, string> = {
  AVAILABLE: "blue",
  PENDING: "gold",
  ASSIGNED: "purple",
  IN_TRANSIT: "orange",
  DELIVERED: "green",
  CANCELLED: "red",
};

export default function MyLoads() {
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });

  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const router = useRouter();

  useEffect(() => {
    const userObj = getLoggedUserFromLS();
    if (userObj && userObj !== "no user found") {
      setLoggedUser(userObj);
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchLoads = async () => {
      if (loggedUser.userId) {
        const allLoads = await getLoadsById({ shipperId: loggedUser.userId });
        if (allLoads) {
          setLoads(allLoads);
        }
      }
    };
    fetchLoads();
  }, [loggedUser.userId]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const filtered =
    selectedStatus === "ALL"
      ? loads
      : loads.filter((l) => l.status === selectedStatus);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedLoads = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDateTime = (str: string) =>
    new Date(str).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const labelStyle = { fontWeight: 500, fontSize: 13, color: "#888" };
  const valueStyle = { fontWeight: 600, fontSize: 14, color: "#000" };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>My Loads</Typography.Title>
      <Typography.Text type="secondary">
        Logged in as: <strong>{loggedUser.email}</strong>
      </Typography.Text>

      <Divider />

      {/* Status Filter */}
      <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
        <Typography.Text strong>Status:</Typography.Text>
        <Select
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          style={{ width: 200 }}
        >
          <Option value="ALL">All</Option>
          <Option value="AVAILABLE">Available</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="ASSIGNED">Assigned</Option>
          <Option value="IN_TRANSIT">In Transit</Option>
          <Option value="DELIVERED">Delivered</Option>
          <Option value="CANCELLED">Cancelled</Option>
        </Select>
      </Flex>

      {filtered.length > 0 ? (
        <>
          <Flex vertical gap={16}>
            {paginatedLoads.map((load) => (
              <Card
                key={load.id}
                style={{
                  borderRadius: 12,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}
                bodyStyle={{ padding: 20 }}
              >
                <Row gutter={[16, 12]} align="middle" justify="space-between">
                  <Col xs={24} md={5}>
                    <Space direction="vertical" size={2}>
                      <Typography.Text style={labelStyle}>
                        Origin
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.origin.city}, {load.origin.state}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {load.origin.postalCode}
                      </Typography.Text>
                    </Space>
                  </Col>

                  <Col xs={24} md={5}>
                    <Space direction="vertical" size={2}>
                      <Typography.Text style={labelStyle}>
                        Destination
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.destination.city}, {load.destination.state}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {load.destination.postalCode}
                      </Typography.Text>
                    </Space>
                  </Col>

                  <Col xs={12} md={3}>
                    <Typography.Text style={labelStyle}>
                      Equipment
                    </Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {load.specialRequirements}
                    </Typography.Text>
                  </Col>

                  <Col xs={12} md={3}>
                    <Typography.Text style={labelStyle}>
                      Cargo Type
                    </Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {load.cargoType}
                    </Typography.Text>
                  </Col>

                  <Col xs={12} md={4}>
                    <Typography.Text style={labelStyle}>Pickup</Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {formatDateTime(load.pickupWindowStart)}
                    </Typography.Text>
                  </Col>

                  <Col xs={12} md={4}>
                    <Typography.Text style={labelStyle}>
                      Delivery
                    </Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {formatDateTime(load.deliveryWindowEnd)}
                    </Typography.Text>
                  </Col>

                  <Col xs={24} md={2}>
                    <Flex align="center" gap={8}>
                      <Button
                        icon={<EyeOutlined />}
                        type="primary"
                        style={{
                          backgroundColor: "#8205AF",
                          borderRadius: 6,
                          width: "100%",
                        }}
                        onClick={() => router.push(`/myloads/${load.id}`)}
                      >
                        View
                      </Button>
                      <Tag
                        color={statusColors[load.status]}
                        style={{ fontWeight: 600, textAlign: "right" }}
                      >
                        {load.status.replace("_", " ")}
                      </Tag>
                    </Flex>
                  </Col>
                </Row>
              </Card>
            ))}
          </Flex>

          {/* Custom Pagination */}
          {filtered.length > ITEMS_PER_PAGE && (
            <Flex
              justify="center"
              align="center"
              gap={16}
              style={{ marginTop: 24 }}
            >
              <Button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </Button>
              <Typography.Text>
                Page {currentPage} of {totalPages}
              </Typography.Text>
              <Button
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      ) : (
        <Typography.Text>No loads found.</Typography.Text>
      )}
    </div>
  );
}
