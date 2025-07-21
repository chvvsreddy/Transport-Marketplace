"use client";

import {
  getLoggedUserFromLS,
  LoggedUser,
} from "@/app/util/getLoggedUserFromLS";
import { getLoads, getLoadsById } from "@/state/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Typography, Flex, Button, Select, Input, Row, Col, Spin } from "antd";
import LoadCard from "@/app/util/LoadCard";
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
interface Requirements {
  size: string;
  type: string;
  acOption: string;
  trollyOption: string;
}
export interface Load {
  id: string;
  origin: Location;
  destination: Location;
  shipperId: string;
  specialRequirements: Requirements;
  cargoType: string;
  trucks: number;
  pickupWindowStart: string;
  deliveryWindowEnd: string;
  status: LoadStatus;
  createdAt: string;
}

export default function MyLoads() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | "ALL">(
    "ALL"
  );
  const [loading, setLoading] = useState(true);
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
    if (userObj.type === "INDIVIDUAL_DRIVER") {
      router.push("/login");
    }
    if (userObj.type === "ADMIN") setIsAdmin(true);
    if (userObj.userId != "no user") setLoggedUser(userObj);
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchLoads = async () => {
      if (loggedUser) {
        const fetchedLoads = isAdmin
          ? await getLoads()
          : await getLoadsById({ shipperId: getLoggedUserFromLS().userId });
        const sortedLoads = fetchedLoads.sort(
          (a: Load, b: Load) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLoads(sortedLoads);
      }

      setLoading(false);
    };
    fetchLoads();
  }, [loggedUser, isAdmin]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedOriginSearchQuery(originSearchQuery);
      setDebouncedDestinationSearchQuery(destinationSearchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [originSearchQuery, destinationSearchQuery]);

  const handlePrev = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);

  const filteredLoads = loads.filter(
    (load) =>
      (selectedStatus === "ALL" || load.status === selectedStatus) &&
      load.origin.city
        .toLowerCase()
        .includes(debouncedOriginSearchQuery.toLowerCase()) &&
      load.destination.city
        .toLowerCase()
        .includes(debouncedDestinationSearchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLoads.length / ITEMS_PER_PAGE);

  const paginatedLoads = filteredLoads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentLoads = isAdmin
    ? loads
    : loads.filter((load) => load.shipperId === getLoggedUserFromLS().userId);

  const currentAvailableLoads = currentLoads.filter(
    (load) => load.status === "AVAILABLE"
  );

  const currentPendingLoads = currentLoads.filter(
    (load) => load.status === "PENDING"
  );

  const currentAssignedLoads = currentLoads.filter(
    (load) => load.status === "ASSIGNED"
  );

  const currentInTransitLoads = currentLoads.filter(
    (load) => load.status === "IN_TRANSIT"
  );

  const currentDeliveredLoads = currentLoads.filter(
    (load) => load.status === "DELIVERED"
  );

  const currentCancelledLoads = currentLoads.filter(
    (load) => load.status === "CANCELLED"
  );
  return (
    <>
      <Spin spinning={loading}>
        <Row className="pr-4">
          <Col span={24} md={6}>
            <Heading name={isAdmin ? "All Loads (Admin View)" : "My Loads"} />
          </Col>
          <Col span={24} md={18}>
            <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
              <div className="page-filter-tabs active">
                {" "}
                {currentLoads.length} All
              </div>
              <div className="page-filter-tabs">
                {currentAvailableLoads.length} Available
              </div>
              <div className="page-filter-tabs">
                {currentPendingLoads.length} Pending
              </div>
              <div className="page-filter-tabs">
                {currentAssignedLoads.length} Assigned
              </div>
              <div className="page-filter-tabs">
                {currentInTransitLoads.length} InTransit
              </div>
              <div className="page-filter-tabs">
                {currentDeliveredLoads.length} Delivered
              </div>
              <div className="page-filter-tabs">
                {currentCancelledLoads.length} Cancelled
              </div>
            </div>
          </Col>
        </Row>

        <div className="main-content">
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

            <Input
              placeholder="Search by origin city"
              value={originSearchQuery}
              onChange={(e) => setOriginSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />

            <Input
              placeholder="Search by destination city"
              value={destinationSearchQuery}
              onChange={(e) => setDestinationSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
          </Flex>

          {paginatedLoads.map((load) => (
            <LoadCard key={load.id} load={load} />
          ))}

          {filteredLoads.length > ITEMS_PER_PAGE && (
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
        </div>
      </Spin>
    </>
  );
}
