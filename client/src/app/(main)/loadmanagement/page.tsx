"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Flex,
  Row,
  Typography,
  Input,
  Card,
  Select,
} from "antd";
import { getLoads } from "@/state/api";
import Link from "next/link";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { useRouter } from "next/navigation";

const { Option } = Select;

interface Location {
  city: string;
  state: string;
  postalCode: string;
}

type LoadStatus =
  | "AVAILABLE"
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

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

const ITEMS_PER_PAGE = 4;

export default function Posted() {
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });

  const [loads, setLoads] = useState<Load[]>([]);
  const [filtered, setFiltered] = useState<Load[]>([]);
  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoadStatus | "ALL">("ALL");

  const [debouncedOrigin, setDebouncedOrigin] = useState(originFilter);
  const [debouncedDestination, setDebouncedDestination] =
    useState(destinationFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const router = useRouter();

  useEffect(() => {
    const userObj = getLoggedUserFromLS();
    if (
      userObj &&
      userObj !== "no user found" &&
      (userObj.type === "ADMIN" || userObj.type === "LOGISTICS_COMPANY")
    ) {
      setLoggedUser(userObj);
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const data = await getLoads();
        setLoads(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching loads", err);
      }
    };
    fetchLoads();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrigin(originFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [originFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDestination(destinationFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [destinationFilter]);

  useEffect(() => {
    const filteredLoads = loads.filter((load) => {
      const matchesOrigin = (load.origin?.city ?? "")
        .toLowerCase()
        .includes(debouncedOrigin.toLowerCase());

      const matchesDestination = (load.destination?.city ?? "")
        .toLowerCase()
        .includes(debouncedDestination.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || load.status === statusFilter;

      return matchesOrigin && matchesDestination && matchesStatus;
    });

    setFiltered(filteredLoads);
    setCurrentPage(1);
  }, [debouncedOrigin, debouncedDestination, statusFilter, loads]);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const labelStyle = { fontWeight: 600, fontSize: 12, color: "#555" };
  const valueStyle = { fontSize: 14, fontWeight: 500 };

  const formatDateTime = (str: string) =>
    new Date(str).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            Loads
          </Typography.Title>
        </Col>

        {/* Filters */}
        <Col span={24}>
          <Flex gap={12} style={{ marginBottom: 16 }} wrap="wrap">
            <Input
              placeholder="Filter by origin city"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              style={{ maxWidth: 250 }}
            />
            <Input
              placeholder="Filter by destination city"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              style={{ maxWidth: 250 }}
            />
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 200 }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="AVAILABLE">Available</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="IN_TRANSIT">In Transit</Option>
              <Option value="DELIVERED">Delivered</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical style={{ width: "100%" }} gap={16}>
            {paginatedData.length > 0 ? (
              paginatedData.map((load) => (
                <Card
                  key={load.id}
                  style={{
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Origin
                      </Typography.Text>
                      <Flex vertical>
                        <Typography.Text style={valueStyle}>
                          {load.origin.postalCode}
                        </Typography.Text>
                        <Typography.Text style={valueStyle}>
                          {load.origin.city}
                        </Typography.Text>
                      </Flex>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Destination
                      </Typography.Text>
                      <Flex vertical>
                        <Typography.Text style={valueStyle}>
                          {load.destination.postalCode}
                        </Typography.Text>
                        <Typography.Text style={valueStyle}>
                          {load.destination.city}
                        </Typography.Text>
                      </Flex>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Equipment Type
                      </Typography.Text>
                      <br />
                      <Typography.Text style={valueStyle}>
                        {load.specialRequirements}
                      </Typography.Text>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Shipment Type
                      </Typography.Text>
                      <br />
                      <Typography.Text style={valueStyle}>
                        {load.cargoType}
                      </Typography.Text>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Est Pickup
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {formatDateTime(load.pickupWindowStart)}
                      </Typography.Text>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Typography.Text style={labelStyle}>
                        Est Delivery
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {formatDateTime(load.deliveryWindowEnd)}
                      </Typography.Text>
                    </Col>

                    <Col xs={24} md={2}>
                      <Link href={`/loadmanagement/${load.id}`}>
                        <Button
                          type="primary"
                          style={{
                            backgroundColor: "#8205AF",
                            borderRadius: 6,
                            width: "100%",
                            marginTop: 8,
                          }}
                        >
                          View
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Typography.Text>No trips found</Typography.Text>
            )}
          </Flex>
        </Col>
      </Row>

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
          <Button onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </Button>
        </Flex>
      )}
    </>
  );
}
