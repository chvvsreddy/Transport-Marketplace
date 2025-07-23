"use client";
import React, { useEffect, useState, useLayoutEffect } from "react";
import Heading from "@/app/util/Heading";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import {
  getActiveBidsByCarrierId,
  getBidsByLoadId,
  getLoads,
  getLoadsById,
  getTripsByLoadId,
} from "@/state/api";
import { Button, Col, Row, Typography, Tag, DatePicker, Input } from "antd";
import { useRouter } from "next/navigation";
import { EyeOutlined } from "@ant-design/icons";

import { getStatusColor } from "@/app/util/statusColorLoads";
import Shimmer from "../(components)/shimmerUi/Shimmer";

interface Trips {
  id: string;
  loadId: string;
  driverId: string;
  vehicleId: string;
  plannedRoute: unknown;
  actualRoute?: unknown;
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: Date;
}

interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  price: number;
  status: string;
  createdAt: string;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
  negotiateShipperPrice: number;
}

interface Location {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  address?: string;
  country?: string;
  postalCode?: string;
}

interface Load {
  id: string;
  origin: Location;
  destination: Location;
  shipperId: string;
  status: string;
  cargoType: string;
  weight: number;
  bidPrice: number;
  price: number;
  createdAt: string;
  pickupWindowStart: string;
  specialRequirements: string;
  deliveryWindowEnd: string;
}

interface ExtendedLoad extends Load {
  bids: Bid[];
  trips: Trips[];
}

export default function Trips() {
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [loads, setLoads] = useState<ExtendedLoad[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [loggedUser, setLoggedUser] = useState({ email: "", userId: "" });
  const [isLoading, setIsLoading] = useState(true);
  const { Text } = Typography;
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    const user = getLoggedUserFromLS();
    if (user.type === "ADMIN") {
      setIsAdmin(true);
    } else if (user.type === "INDIVIDUAL_DRIVER") {
      setIsDriver(true);
    }
    setLoggedUser(user);
  }, []);

  useLayoutEffect(() => {
    if (loggedUser?.userId) {
      const fetchData = async () => {
        try {
          let currentUserLoads;
          if (isAdmin) {
            currentUserLoads = await getLoads();
          } else if (isDriver) {
            const bids = await getActiveBidsByCarrierId(
              getLoggedUserFromLS().userId
            );
            currentUserLoads = bids;
          } else {
            currentUserLoads = await getLoadsById({
              shipperId: loggedUser.userId,
            });
          }

          const loadsWithDetails: ExtendedLoad[] = await Promise.all(
            currentUserLoads.map(async (load: Load) => {
              const [bids, trips] = await Promise.all([
                getBidsByLoadId({ loadId: load.id }),
                getTripsByLoadId({ loadId: load.id }),
              ]);
              return { ...load, bids, trips };
            })
          );

          setLoads(loadsWithDetails);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch data: ", error);
        }
      };
      fetchData();
    }
  }, [loggedUser, isAdmin, isDriver]);

  const totalPages = Math.ceil(
    loads.filter((l) => l.status === "ASSIGNED").length / pageSize
  );

  const paginatedLoads = loads
    .filter((load) => load.status === "ASSIGNED")
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const formatLocation = (location: Location) =>
    `${location.city ?? ""}, ${location.state ?? ""}, ${
      location.country ?? ""
    }`;

  const renderTripStatus = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Tag color="green">Scheduled</Tag>;
      case "IN_PROGRESS":
        return <Tag color="orange">In Progress</Tag>;
      case "COMPLETED":
        return <Tag color="green">Completed</Tag>;
      case "CANCELLED":
        return <Tag color="red">Cancelled</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  return isLoading ? (
    <Shimmer />
  ) : (
    <>
      <Row className="pr-4">
        <Col span={24} md={6}>
          <Heading name="Trips" />
        </Col>
        <Col span={24} md={18}>
          <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
            <div className="page-filter-tabs active">5 All</div>
            <div className="page-filter-tabs">1 Not Started</div>
            <div className="page-filter-tabs">2 InTransit</div>
            <div className="page-filter-tabs">1 Completed</div>
          </div>
        </Col>
      </Row>

      <div className="main-content">
        <div className="flex gap-4 mb-4">
          <DatePicker.RangePicker />
          <Input
            placeholder="Search Origin City"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            style={{ width: 180 }}
          />
          <Input
            placeholder="Search Destination City"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            style={{ width: 200 }}
          />
        </div>

        {paginatedLoads.length > 0 ? (
          paginatedLoads.map((load) => (
            <div key={load.id} className="box !p-0 mb-4">
              <div className="p-4 flex justify-between flex-col md:flex-row gap-y-4">
                <div>
                  <Text className="labelStyle">Origin</Text>
                  <br />
                  <Text className="valueStyle">
                    {formatLocation(load.origin)}
                  </Text>
                </div>
                <div>
                  <Text className="labelStyle">Destination</Text>
                  <br />
                  <Text className="valueStyle">
                    {formatLocation(load.destination)}
                  </Text>
                </div>
                <div>
                  <Text className="labelStyle">Cargo Type</Text>
                  <br />
                  <Text className="valueStyle">{load.cargoType}</Text>
                </div>
                <div>
                  {load.bids.length > 0 ? (
                    load.bids.map((bid: Bid) => (
                      <div key={bid.id}>
                        <Text className="labelStyle">Final Price:</Text>
                        <br />
                        <Text className="valueStyle">
                          ₹ {bid.negotiateShipperPrice}
                        </Text>
                      </div>
                    ))
                  ) : (
                    <div>
                      <Text strong>Bid : </Text>
                      <Text
                        className={`${getStatusColor(
                          load.status
                        )} p-1 px-2 text-sm rounded-l-md`}
                      >
                        Fixed Price
                      </Text>
                      <div className="border p-2 my-2 rounded">
                        <Text>
                          Final Price: ₹{load.price} | Status: {load.status}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {load.trips.length > 0 ? (
                    load.trips.map((trip: Trips) => (
                      <div key={trip.id} className="flex justify-between gap-4">
                        <div>
                          <Text className="labelStyle">Trip Status</Text>
                          <br />
                          <Text className="valueStyle">
                            {renderTripStatus(trip.status)}
                          </Text>
                        </div>
                        <div>
                          <Text className="labelStyle">Trip Distance</Text>
                          <br />
                          <Text className="valueStyle">
                            {trip.distance ?? 0} km
                          </Text>
                        </div>
                        <div>
                          <Text className="labelStyle">Trip Duration</Text>
                          <br />
                          <Text className="valueStyle">
                            {trip.estimatedDuration ?? 0} Hours
                          </Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text>No trips assigned yet.</Text>
                  )}
                </div>

                <div>
                  <EyeOutlined
                    onClick={() => router.push(`/myloads/${load.id}`)}
                    className="icon-button"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No trips found.</p>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 items-center gap-4">
            <Button onClick={handlePrev} disabled={currentPage === 1}>
              Prev
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
