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
import { Button, Card, Col, Row, Typography, Space, Tag, DatePicker, Select, Input } from "antd";
import { useRouter } from "next/navigation";
import { EyeOutlined } from "@ant-design/icons";
import { timeSincePosted } from "@/app/util/timeSincePosted";
import { getStatusColor } from "@/app/util/statusColorLoads";
import Title from "antd/es/typography/Title";

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
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
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
        return <Tag color="blue">Scheduled</Tag>;
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
     <Row className="pr-4">
        <Col span={24} md={6}>
          <Heading name="Trips" />
        </Col>
        <Col span={24} md={18}>
          <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
            <div className="page-filter-tabs active">              
                5 All             
            </div>
            <div className="page-filter-tabs">
            1 Not Started
            </div>
            <div className="page-filter-tabs">
            2 InTransit
            </div>
            <div className="page-filter-tabs">
               1 Completed
            </div>                   
          </div>
        </Col>
      </Row>

      <div className="bg-white p-4 m-4 rounded-xl shadow-md mt-4">
      <div className="flex gap-4">
          <DatePicker.RangePicker  />

          <Input placeholder="Search Origin City"
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
        {loads.length > 0 ? (
          loads.map(
            (load) =>
              load.status === "ASSIGNED" && (
                <div key={load.id} className="box !p-0">
                  {/* <Text style={valueStyle}>Load : </Text>
                  <Text
                    className={`${getStatusColor(
                      load.status
                    )} p-1 px-2 text-sm rounded-l-md`}
                  >
                    {load.status}
                  </Text>
                  <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">
                    {timeSincePosted(load.createdAt)}
                  </Text> */}
                  <div className="p-4 flex justify-between flex-col md:flex-row gap-y-4" >
                    <div >
                        <Text style={labelStyle}>Origin</Text><br />
                        <Text style={valueStyle}>
                          {formatLocation(load.origin)}
                        </Text>
                
                    </div>
                    <div >
                        <Text style={labelStyle}>Destination</Text><br />
                        <Text style={valueStyle}>
                          {formatLocation(load.destination)}
                        </Text>
                            </div>
                    <div >
                      <Text style={labelStyle}>Cargo Type</Text>
                      <br />
                      <Text style={valueStyle}>{load.cargoType}</Text>
                    </div>
                    <div >
                    {/* Display Bids */}
                  {load.bids.length > 0 ? (
                    <>
                      {/* <Text strong >Bid : </Text>
                      <Text
                        className={`${getStatusColor(
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
                      </Text> */}
                      {load.bids.map((bid: Bid) => (
                        <div key={bid.id} >
                          <Text style={labelStyle}>Final Price:</Text><br/>
                          <Text style={valueStyle}>
                            ₹ {bid.negotiateShipperPrice} 
                            {/* | Status:{" "} {bid.status} */}
                          </Text>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <Text strong>Bid : </Text>

                      <Text
                        className={`${getStatusColor(
                          load.status
                        )} p-1 px-2 text-sm rounded-l-md`}
                      >
                        {load.status}
                      </Text>
                      <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">
                        {timeSincePosted(load.createdAt).replace(
                          "Posted",
                          "Accepted "
                        )}
                      </Text>

                      <div key={load.id} className="border p-2 my-2 rounded">
                        <Text>
                          Final Price: ${load.price} | Status: {load.status}
                        </Text>
                      </div>
                    </>
                  )}
                    </div>
            
                  {/* Display Trips */}
                  {load.trips.length > 0 ? (
                    <>
                      {/* <Text strong>Trip : </Text>
                      <Text
                        className={`${getStatusColor(
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
                      </Text> */}
                      {load.trips.map((trip: Trips, index) => (
                        <div key={trip.id ?? index} className="flex justify-between gap-4" >
                          <div >
                          <Text style={labelStyle}>Trip Status </Text><br/>
                          <Text style={valueStyle}>{renderTripStatus(trip.status ?? "IN_PROGRESS")}</Text>
                          </div>
                          <div >
                          <Text style={labelStyle}>Trip Distance  </Text><br/>
                          <Text style={valueStyle}>{trip.distance ?? 0} km</Text> 
                          </div>
                          <div >
                          <Text style={labelStyle}>Trip Duration  </Text><br/>
                          <Text style={valueStyle}>{trip.estimatedDuration ?? 0} Hours</Text>
                          </div>    
                        </div>
                      ))}
                    </>
                  ) : (
                    <Text>No trips assigned yet.</Text>
                  )}
                      <div>
                      <EyeOutlined onClick={() => router.push(`/myloads/${load.id}`)} className="icon-button"/>
              
                    </div> 

                  </div>
                </div>
              )
          )
        ) : (
          <p>No trips found.</p>
        )}
      </div>
    </>
  );
}
