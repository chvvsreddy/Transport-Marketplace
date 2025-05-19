"use client";
import React, { useEffect, useState } from "react";
import Heading from "@/app/util/Heading";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import {
  getBidsByLoadId,
  getLoads,
  getLoadsById,
  getTripsByLoadId,
} from "@/state/api";
import { Button, Card, Col, Row, Typography, Space, Tag } from "antd";
import { useRouter } from "next/navigation";
import { EyeOutlined } from "@ant-design/icons";
import { timeSincePosted } from "@/app/util/timeSincePosted";
import { getStatusColor, getStatusColorForBids, getStatusColorForTrips } from "@/app/util/statusColorLoads";

interface Trips {
  id: string;
  loadId: string;
  driverId: string;
  vehicleId: string;
  plannedRoute: any;
  actualRoute?: any;
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
  const [loads, setLoads] = useState<ExtendedLoad[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedUser, setLoggedUser] = useState({ email: "", userId: "" });
  const { Text } = Typography;
  const router = useRouter();

  const labelStyle = { fontWeight: 500, fontSize: 13, color: "#888" };
  const valueStyle = { fontWeight: 600, fontSize: 14, color: "#000" };

  useEffect(() => {
    const user = getLoggedUserFromLS();
    if (user.type === "ADMIN") {
      setIsAdmin(true);
    }
    setLoggedUser(user);
  }, []);

  useEffect(() => {
    if (loggedUser?.userId) {
      const fetchData = async () => {
        try {
          const currentUserLoads = isAdmin
            ? await getLoads()
            : await getLoadsById({
                shipperId: loggedUser.userId,
              });

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
        } catch (error) {
          console.error("Failed to fetch data: ", error);
        }
      };
      fetchData();
    }
  }, [loggedUser]);

  const formatLocation = (location: Location) => {
    return `${location.city ?? ""}, ${location.state ?? ""}, ${
      location.country ?? ""
    }`;
  };

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
  console.log(loads);
  return (
    <>
      <Heading name="Trips" />
      <div className="bg-white p-4 m-4 rounded-xl shadow-md mt-4">
        {loads.length > 0 ? (
          loads.map(
            (load) =>
              load.status === "ASSIGNED" && (
                <Card
                  key={load.id}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    marginBottom: 16,
                  }}
                >
                  <Text style={valueStyle}>Load : </Text>
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
                  <Row gutter={[16, 12]}>
                    <Col span={6}>
                      <Space direction="vertical">
                        <Text style={labelStyle}>Origin</Text>
                        <Text style={valueStyle}>
                          {formatLocation(load.origin)}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={6}>
                      <Space direction="vertical">
                        <Text style={labelStyle}>Destination</Text>
                        <Text style={valueStyle}>
                          {formatLocation(load.destination)}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={6}>
                      <Text style={labelStyle}>Cargo Type</Text>
                      <br />
                      <Text style={valueStyle}>{load.cargoType}</Text>
                    </Col>
                    <Col span={6}>
                      <Button
                        icon={<EyeOutlined />}
                        className="button-primary max-h-10"
                        style={{ borderRadius: 6, width: "100%" }}
                        onClick={() => router.push(`/myloads/${load.id}`)}
                      >
                        View
                      </Button>
                    </Col>
                  </Row>

                  {/* Display Bids */}
                  {load.bids.length > 0 ? (
                    <>
                      <Text strong>Bid : </Text>
                      <Text
                        className={`${getStatusColorForBids(
                          load.bids[0].status
                        )} p-1 px-2 text-sm rounded-l-md`}
                      >
                        {load.bids[0].status}
                      </Text>
                      <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">
                        {timeSincePosted(load.bids[0].createdAt).replace(
                          "Posted",
                          "Accepted "
                        )}
                      </Text>
                      {load.bids.map((bid: Bid) => (
                        <div key={bid.id} className="border p-2 my-2 rounded">
                          <Text>
                            Final Price: ₹ {bid.negotiateShipperPrice} | Status:{" "}
                            {bid.status}
                          </Text>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <Text strong>Bid : </Text>
                      <Text
                        className={`${getStatusColorForBids(
                          load.status
                        )} p-1 px-2 text-sm rounded-l-md`}
                      >
                        Fixed Price
                      </Text>

                      <div key={load.id} className="border p-2 my-2 rounded">
                        <Text>
                          Final Price: ${load.price} | Status: {load.status}
                        </Text>
                      </div>
                    </>
                  )}

                  {/* Display Trips */}
                  {load.trips.length > 0 ? (
                    <>
                      <Text strong>Trip : </Text>
                      <Text
                        className={`${getStatusColorForTrips(
                          load.trips[0]?.status ?? "IN_PROGRESS"
                        )} p-1 px-2 text-sm rounded-l-md`}
                      >
                        {load.trips[0]?.status ?? "IN_PROGRESS"}
                      </Text>
                      <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">
                        {load.trips[0]?.createdAt
                          ? timeSincePosted(load.trips[0].createdAt).replace(
                              "Posted",
                              "Accepted"
                            )
                          : "Not Assigned"}
                      </Text>
                      {load.trips.map((trip: Trips, index) => (
                        <div
                          key={trip.id ?? index}
                          className="border p-2 my-2 rounded"
                        >
                          {renderTripStatus(trip.status ?? "IN_PROGRESS")}
                          <Text>
                            {" "}
                            Distance: {trip.distance ?? 0} km | Estimated
                            Duration: {trip.estimatedDuration ?? 0} mins
                          </Text>
                        </div>
                      ))}
                    </>
                  ) : (
                    <Text>No trips assigned yet.</Text>
                  )}
                </Card>
              )
          )
        ) : (
          <p>No trips found.</p>
        )}
      </div>
    </>
  );
}
