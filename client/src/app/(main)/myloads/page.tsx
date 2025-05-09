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
  Input,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { getStatusColor } from "@/app/util/statusColorLoads";
import Heading from "@/app/util/Heading";

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
  createdAt: string;
}

export default function MyLoads() {
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });
  const { Text } = Typography;

  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [debouncedOriginSearchQuery, setDebouncedOriginSearchQuery] =
    useState("");
  const [debouncedDestinationSearchQuery, setDebouncedDestinationSearchQuery] =
    useState("");
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
          const sortedLoads = allLoads.sort(
            (a: Load, b: Load) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLoads(sortedLoads);
        }
      }
    };

    fetchLoads();
  }, [loggedUser.userId]);

  useEffect(() => {
    // Debouncing search queries
    const debounceTimeout = setTimeout(() => {
      setDebouncedOriginSearchQuery(originSearchQuery);
      setDebouncedDestinationSearchQuery(destinationSearchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [originSearchQuery, destinationSearchQuery]);

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

  // Filter loads based on both origin and destination search queries
  const searchedLoads =
    debouncedOriginSearchQuery || debouncedDestinationSearchQuery
      ? filtered.filter(
          (load) =>
            (load.origin.city?.toLowerCase() || "").includes(
              debouncedOriginSearchQuery.toLowerCase()
            ) &&
            (load.destination.city?.toLowerCase() || "").includes(
              debouncedDestinationSearchQuery.toLowerCase()
            )
        )
      : filtered;

  const totalPages = Math.ceil(searchedLoads.length / ITEMS_PER_PAGE);

  const paginatedLoads = searchedLoads.slice(
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
  const timeSincePosted = (timestampStr: string): string => {
    const timestamp = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Posted just now";
    if (days >= 1) return `Posted ${days} day${days > 1 ? "s" : ""} ago`;
    if (hours >= 1) return `Posted ${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `Posted ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  const labelStyle = { fontWeight: 500, fontSize: 13, color: "#888" };
  const valueStyle = { fontWeight: 600, fontSize: 14, color: "#000" };

  return (
    <div>
      <Heading name="My Loads" />

      {/* <Typography.Text type="secondary">
        Logged in as: <strong>{loggedUser.email}</strong>
      </Typography.Text> */}

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

      {/* Origin Search Input */}
      <div className="flex gap-4">

      <Input
        placeholder="Search by origin city"
        value={originSearchQuery}
        onChange={(e) => setOriginSearchQuery(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />

      {/* Destination Search Input */}
      <Input
        placeholder="Search by destination city"
        value={destinationSearchQuery}
        onChange={(e) => setDestinationSearchQuery(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
      </div>
      

      {searchedLoads.length > 0 ? (
        <>
          <Flex vertical gap={16}>
            {paginatedLoads.map((load) => (
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
{/* 
                  <Col xs={12} md={3}>
                    <Typography.Text style={labelStyle}>
                      Equipment
                    </Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {load.specialRequirements}
                    </Typography.Text>
                  </Col> */}

                  <Col xs={12} md={2}>
                    <Typography.Text style={labelStyle}>
                      Cargo Type
                    </Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {load.cargoType}
                    </Typography.Text>
                  </Col>

                  <Col xs={12} md={3}>
                    <Typography.Text style={labelStyle}>Pickup</Typography.Text>
                    <br />
                    <Typography.Text style={valueStyle}>
                      {formatDateTime(load.pickupWindowStart)}
                    </Typography.Text>
                  </Col>

                  <Col xs={12} md={2}>
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
            ))}
          </Flex>

          {/* Pagination */}
          {searchedLoads.length > ITEMS_PER_PAGE && (
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
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: "60vh", textAlign: "center" }}
        >
          <Typography.Text>No loads found.</Typography.Text>
        </Flex>
      )}
    </div>
  );
}
