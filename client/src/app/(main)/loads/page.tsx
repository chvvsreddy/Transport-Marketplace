"use client";

import {
  Row,
  Col,
  Select,
  Button,
  Typography,
  Modal,
  InputNumber,
  Form,
  Empty,
  message,
  Radio,
} from "antd";
import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import Heading from "@/app/util/Heading/index";
import {
  createBid,
  createTrip,
  getActiveVehiclesByOwnerId,
  getBids,
  getDataForTripsAssigning,
  getLoadByLoadIdForAdmin,
  updateVehicleStatus,
  useGetAllLoadsQuery,
} from "@/state/api";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { SocketContext } from "@/app/util/SocketContext";
import { useRouter } from "next/navigation";
import { timeSincePosted } from "@/app/util/timeSincePosted";
import { getStatusColor } from "@/app/util/statusColorLoads";
import Shimmer from "../(components)/shimmerUi/Shimmer";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import Link from "next/link";
import getTokenIdFromLs from "@/app/util/getTokenIdFromLS";

const { Title, Text } = Typography;
const { Option } = Select;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  vehicleType: string;
  isActive: boolean;

  ownerId: string;

  insuranceNumber: string;
  insuranceExpiry: Date;
  fitnessCertExpiry: Date;
  permitType?: string;

  createdAt: Date;
  updatedAt: Date;
  trips?: any[];
  devices?: any[];
}

interface Bid {
  id: string;
  loadId: string;
  load: Load;
  carrierId: string;
  price: number;
  notes?: string;
  status: string;
  vehicleId?: string;
  estimatedDuration: number;
  isCompanyBid: boolean;
  createdAt: string;
  updatedAt: string;
  negotiateShipperPrice: number;
  negotiateDriverPrice: number;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
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

interface User {
  id: string;
  email: string;
}

interface DataWithOutTrips {
  load: Load;
  bid: Bid;
  user: User;
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

const PAGE_SIZE = 5;

const Loads = () => {
  const { data, isLoading, isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = allLoads || [];
  const [location, setLocation] = useState<Location | null>(null);
  const [Bids, setBids] = useState<Bid[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [bidPrice, setBidPrice] = useState<string>("");
  const [isLoadingSpin, setIsLoading] = useState(true);
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[] | undefined>();
  const [dataWithOutTrips, setDataForTrips] = useState<
    DataWithOutTrips[] | undefined
  >();
  const [selectedTrucks, setSelectedTrucks] = useState<{
    [key: string]: string;
  }>({});

  const [expandedLoadIds, setExpandedLoadIds] = useState<string[]>([]);
  const toggleExpand = (id: string) => {
    setExpandedLoadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const [open, setOpen] = React.useState<boolean>(false);

  const { socket } = useContext(SocketContext) || {};
  const router = useRouter();
  const token = getTokenIdFromLs();

  useLayoutEffect(() => {
    if (getLoggedUserFromLS().userId) {
      if (getLoggedUserFromLS().type !== "INDIVIDUAL_DRIVER") {
        router.push("/login");
      }
    }

    const fetchBidsAndSetInitialLoads = async () => {
      const getDataWithoutTrips = await getDataForTripsAssigning(
        getLoggedUserFromLS().userId
      );
      if (getDataWithoutTrips.length > 0) {
        setOpen(true);
      }

      const activeVehicles = await getActiveVehiclesByOwnerId({
        ownerId: getLoggedUserFromLS().userId,
      });

      setActiveVehicles(activeVehicles);
      setDataForTrips(getDataWithoutTrips);
      const bids = await getBids();
      setBids(bids);

      const availableLoads = allData.filter(
        (load) => load.status === "AVAILABLE"
      );
      setFilteredLoads(availableLoads);

      if (!navigator.geolocation) return;
      if (!selectedState && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async ({ coords: { latitude: lat, longitude: lng } }) => {
            try {
              const geoRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
              );
              const geoData = await geoRes.json();

              let stateName = "";
              let formattedAddress = "";

              if (geoData.status === "OK" && geoData.results.length > 0) {
                formattedAddress = geoData.results[0].formatted_address;

                const addressComponents = geoData.results[0].address_components;
                const stateComponent = addressComponents.find(
                  (component: any) =>
                    component.types.includes("administrative_area_level_1")
                );
                stateName = stateComponent ? stateComponent.long_name : "";
              }

              const updatedLocation: Location = {
                lat,
                lng,
                address: formattedAddress,
                state: stateName,
              };
              setLocation(updatedLocation);

              if (selectedState) {
                const filtered = allData.filter(
                  (load) =>
                    load.origin.state?.trim().toLowerCase() ===
                      selectedState.trim().toLowerCase() &&
                    load.status === "AVAILABLE"
                );
                setFilteredLoads(filtered);
              }

              await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    driverUserId: getLoggedUserFromLS().userId,
                    coordinates: updatedLocation,
                  }),
                }
              );
            } catch (err) {
              console.error("Location fetch error:", err);
            }
          },
          (err) => console.warn("Geolocation error:", err.message),
          { enableHighAccuracy: true }
        );
      }
    };

    fetchBidsAndSetInitialLoads();
    setIsLoading(false);
  }, [allData, router, token, selectedState]);

  useEffect(() => {
    if (socket) {
      const updateBidState = (updatedBid: Bid) => {
        message.success("price updated by Shipper");

        setBids((prevBids) => {
          const index = prevBids.findIndex((b) => b.id === updatedBid.id);

          if (index !== -1) {
            const newBids = [...prevBids];
            newBids[index] = updatedBid;
            return newBids;
          } else {
            return [...prevBids, updatedBid];
          }
        });
      };

      const events = [
        "receiveUpdatedBidPrice",
        "receiveUpdatedBidStatus",
        "receiveNewBid",
        "receiveAfterDriverBidViaSocket",
        "receiveFixedLoad",
      ];
      events.forEach((event) => socket.on(event, updateBidState));

      return () => {
        events.forEach((event) => socket.off(event, updateBidState));
      };
    }
  }, [socket]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    const trimmedValue = value.trim().toLowerCase();

    const filtered =
      trimmedValue === "all"
        ? allData
        : allData.filter(
            (load) =>
              load.origin.state?.trim().toLowerCase() === trimmedValue &&
              load.status === "AVAILABLE"
          );

    setFilteredLoads(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLoads.length / PAGE_SIZE);
  const paginatedLoads = filteredLoads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  const showBidModal = (load: Load) => {
    setSelectedLoad(load);
    setIsModalVisible(true);
  };

  const handleBidSubmit = async (loadId: string) => {
    if (selectedLoad && socket) {
      const userId = getLoggedUserFromLS()?.userId;
      const priceNum = Number(bidPrice);

      if (priceNum <= 0) {
        return message.error("amount should be greater then zero");
      }

      const existingBid = Bids.find(
        (bid) => bid.loadId === selectedLoad.id && bid.carrierId === userId
      );
      const findUserIdByLoad = allLoads?.find(
        (load) => load.id === existingBid?.loadId
      );
      const loggedUser = getLoggedUserFromLS();
      const getLoad = await getLoadByLoadIdForAdmin(loadId);
      console.log("vinay loa d : ", getLoad);
      // if (getLoad.status === "ASSIGNED") {
      //   message.error("Load already assigned");
      //   return;
      // }
      if (existingBid) {
        socket?.emit("updateBidAmount", {
          bidId: existingBid.id,
          shipperId: loggedUser.userId,
          price: priceNum,
          toUser:
            loggedUser.type === "INDIVIDUAL_DRIVER"
              ? findUserIdByLoad?.shipperId
              : existingBid.carrierId,
        });
      } else {
        if (getLoad.status === "AVAILABLE") {
          const newBid = await createBid({
            loadId: selectedLoad.id,
            userId,
            price: priceNum,
            negotiateDriverPrice: priceNum,
          });

          if (newBid.id) {
            message.success("Bid updated success");
          }
          socket.emit("passNewBid", { newBid, toUser: selectedLoad.shipperId });
        } else {
          message.error("load already assigned");
        }
      }

      setIsModalVisible(false);
      setBidPrice("");
    }
  };

  const acceptBidWithoutBid = async (
    idOfLoad: string,
    loadShipperId: string
  ) => {
    try {
      const getLoad = await getLoadByLoadIdForAdmin(idOfLoad);

      if (getLoad.status === "AVAILABLE") {
        socket?.emit("fixedAcceptLoad", {
          loadId: idOfLoad,
          toUser: loadShipperId,
          fromUser: getLoggedUserFromLS().userId,
        });
      } else {
        message.error("Bid is closed!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //accept btn
  const handleBidStatus = async (bidId: string, loadId: string) => {
    try {
      const getLoad = await getLoadByLoadIdForAdmin(loadId);

      if (getLoad.status === "AVAILABLE") {
        const currentBid = Bids.find((bid) => bid.id === bidId);
        const findUserIdByLoad = allLoads?.find(
          (load) => load.id === currentBid?.loadId
        );
        socket?.emit("updateBidStatus", {
          bidId,
          shipperId: getLoggedUserFromLS().userId,
          loadId,
          toUser:
            getLoggedUserFromLS().type === "INDIVIDUAL_DRIVER"
              ? findUserIdByLoad?.shipperId
              : currentBid?.carrierId,
        });
      } else {
        message.error("Bid is closed!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading)
    return (
      <div className="py-4">
        <Shimmer />
      </div>
    );
  if (isError || !allData)
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch Loads</div>
    );

  const countOfBid = Bids.filter(
    (bid) => bid.carrierId === getLoggedUserFromLS().userId
  );

  const countOfFixedLoads = allData.filter(
    (load) => load.price >= 0 && load.bidPrice == 0
  );
  const countOfBidLoads = allData.filter(
    (load) => load.price >= 0 && load.bidPrice > 0
  );
  const handleConfirmLoad = async (load: Load, bid: Bid) => {
    const findVehicle = activeVehicles?.find(
      (veh) => veh.registrationNumber === selectedTrucks[load.id]
    );
    console.log({
      loadId: load.id,
      driverId: bid.carrierId,
      plannedRoute: {
        distance: 0,
        waypoints: [
          {
            lat: load.origin.lat,
            lng: load.origin.lng,
          },
          {
            lat: load.destination.lat,
            lng: load.destination.lng,
          },
        ],
      },
      vehicleId: findVehicle?.id,
      estimatedDuration: 0,
      distance: 0,
    });
    const getDataWithoutTrips = await getDataForTripsAssigning(
      getLoggedUserFromLS().userId
    );

    setDataForTrips(getDataWithoutTrips);
    console.log(
      "Confirmed load:",
      load,
      "with truck:",
      bid,
      findVehicle?.registrationNumber
    );
    const createdTrip = await createTrip({
      loadId: load.id,
      driverId: bid.carrierId,
      plannedRoute: {
        distance: 0,
        waypoints: [
          {
            lat: load.origin.lat,
            lng: load.origin.lng,
          },
          {
            lat: load.destination.lat,
            lng: load.destination.lng,
          },
        ],
      },
      vehicleId: findVehicle?.id,
      estimatedDuration: 0,
      distance: 0,
    });
    console.log("new trip : ", createdTrip);
    if (createdTrip.id) {
      const updateVehicle = await updateVehicleStatus({
        registrationNumber: selectedTrucks[load.id],
        newTrip: createdTrip,
      });
      setOpen(false);
      console.log(updateVehicle);
    } else {
      message.error("trip not created");
    }
  };

  return isLoadingSpin ? (
    <Shimmer />
  ) : (
    <>
      <div className="text-md text-gray-600 m-4 mb-0">
        {location ? (
          <>
            <strong>Current Location:</strong> {location.address}
          </>
        ) : (
          <>
            <strong>Location not available</strong>
          </>
        )}
      </div>
      <div className="py-4">
        <Row className="pr-4">
          <Col span={24} md={12}>
            <Heading name="All Loads" />
          </Col>

          <Col span={24} md={12}>
            <div className="flex flex-wrap md:justify-end gap-2 mt-2 md:mt-0">
              <div className="page-filter-tabs active">
                {allData.length} All
              </div>
              <div className="page-filter-tabs">
                {countOfFixedLoads.length} Fixed Price
              </div>
              <div className="page-filter-tabs">
                {countOfBidLoads.length < 10
                  ? `0${countOfBidLoads.length}`
                  : countOfBidLoads.length}{" "}
                Bid Price
              </div>
            </div>
          </Col>
        </Row>
        <div className={`bg-white p-4 sm:m-4 rounded-xl shadow-md mt-4 `}>
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold mt-2 text-gray-700">
              Your Bids
            </h3>
            <div className="bg-red-100 p-2 text-black rounded-md mb-2">
              <b>2 Carriars</b> from <b>2 Bids</b> Responded.
            </div>
          </div>
          {countOfBid.length === 0 ? (
            <Empty description="You have not placed any bids yet." />
          ) : (
            Bids.map((bid) => {
              const load: any = allData.find((l) => l.id === bid.loadId);
              if (!load) return null;
              const isBidLoad = bid.carrierId === getLoggedUserFromLS().userId;
              return (
                isBidLoad && (
                  <div
                    className="grid grid-cols-4 md:grid-cols-7 gap-4 border rounded-md p-2 mt-2 mb-2 border-neutral-300"
                    key={load.id}
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
                      <Title level={5} className="mt-1! mb-0!">
                        {load.origin.city} → {load.destination.city}
                      </Title>
                    </div>

                    <div className="md:col-span-1">
                      <Text>
                        Type:
                        <span className="font-semibold">
                          <br />
                          {load.cargoType}
                        </span>
                      </Text>
                    </div>

                    <Text>
                      Weight:
                      <span className="font-semibold">
                        <br />
                        {load.weight} Tons
                      </span>
                    </Text>

                    <Text>
                      {isBidLoad ? "Bid Price" : "Fixed Price"}:
                      <span className="font-semibold">
                        <br />₹{bid.negotiateShipperPrice}
                      </span>
                    </Text>

                    <Text className="col-span-2 md:col-span-1">
                      Your price:
                      <span className="font-semibold">
                        <br />₹{bid.negotiateDriverPrice}
                      </span>
                    </Text>

                    <div className="flex justify-end">
                      {isBidLoad && (
                        <>
                          {load.status === "AVAILABLE" &&
                            bid &&
                            bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice == 0 && (
                              <span className="max-h-10 text-red-800 text-sm">
                                Waiting for shipper response
                              </span>
                            )}
                          {bid.isDriverAccepted &&
                            bid.isShipperAccepted === false &&
                            bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice > 0 && (
                              <span className="max-h-10 text-red-800 text-sm">
                                Waiting for shipper response
                              </span>
                            )}
                          {bid &&
                            bid.isDriverAccepted &&
                            bid.isShipperAccepted && (
                              <span className="max-h-10 text-green-800 text-sm">
                                Load accepted
                              </span>
                            )}
                          {load.status === "ASSIGNED" &&
                            bid &&
                            bid.isDriverAccepted == false &&
                            bid.isShipperAccepted == false && (
                              <span className="max-h-10 text-red-800 text-sm">
                                Bid closed!
                              </span>
                            )}
                          {load.status === "AVAILABLE" &&
                            bid.isDriverAccepted === false &&
                            bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice > 0 && (
                              <Button
                                className="button-primary max-h-10"
                                onClick={() => handleBidStatus(bid.id, load.id)}
                              >
                                Accept
                              </Button>
                            )}
                          {load.status === "ASSIGNED" &&
                            bid.isDriverAccepted === false &&
                            bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice > 0 && (
                              <span className="max-h-10 text-red-800 text-sm">
                                Bid is closed!
                              </span>
                            )}

                          {bid.negotiateDriverPrice == 0 &&
                            bid.negotiateShipperPrice == 0 && (
                              <>
                                <Button
                                  className="button-primary max-h-10"
                                  onClick={() =>
                                    acceptBidWithoutBid(load.id, load.shipperId)
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  className="button-secondary max-h-10"
                                  onClick={() => showBidModal(load)}
                                >
                                  Bid
                                </Button>
                              </>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                )
              );
            })
          )}
          <Row justify="space-between" align="middle" className="mb-4">
            <h3 className="text-xl font-semibold mt-2 text-gray-700">
              Available Loads
            </h3>

            <Select
              placeholder="Filter by State"
              onChange={handleStateChange}
              allowClear
              style={{ width: 200 }}
            >
              <Option value="All">All</Option>
              {INDIAN_STATES.map((state) => (
                <Option key={state} value={state}>
                  {state}
                </Option>
              ))}
            </Select>
          </Row>

          {paginatedLoads.length === 0 ? (
            <>
              <Empty description="No loads available in this route" />
            </>
          ) : (
            paginatedLoads.map((load) => {
              const isBidLoad = load.bidPrice > 0;
              const isFixedLoad = load.bidPrice === 0 && load.price > 0;
              const currentUserBid: Bid | any = Bids.find(
                (bid) =>
                  bid.loadId === load.id &&
                  bid.carrierId === getLoggedUserFromLS().userId
              );

              return (
                <div
                  className="grid grid-cols-3 md:grid-cols-7 gap-4 border rounded-md p-2 mb-2 border-neutral-300"
                  key={load.id}
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
                    <Title level={5} className="mt-1! mb-0!">
                      {load.origin.city} → {load.destination.city}
                    </Title>
                  </div>

                  <div className="md:col-span-2">
                    <Text>
                      Type:
                      <span className="font-semibold">
                        <br />
                        {load.cargoType}
                      </span>
                    </Text>
                  </div>

                  <Text>
                    Weight:
                    <span className="font-semibold">
                      <br />
                      {load.weight} Tons
                    </span>
                  </Text>

                  <Text>
                    Price ({isBidLoad ? "Bid Price" : "Fixed Price"}):
                    <span className="font-semibold">
                      <br />₹{load.price}
                    </span>
                  </Text>

                  <div className="flex justify-end">
                    {isFixedLoad && !currentUserBid && (
                      <Button
                        className="button-primary max-h-10"
                        onClick={() => {
                          acceptBidWithoutBid(load.id, load.shipperId);
                        }}
                      >
                        Accept
                      </Button>
                    )}
                    {isBidLoad && (
                      <>
                        {currentUserBid &&
                          currentUserBid.negotiateDriverPrice > 0 &&
                          currentUserBid.negotiateShipperPrice == 0 && (
                            <span className="max-h-10 text-red-800 text-sm">
                              Waiting for shipper response
                            </span>
                          )}
                        {currentUserBid?.isDriverAccepted &&
                          currentUserBid.isShipperAccepted === false &&
                          currentUserBid.negotiateDriverPrice > 0 &&
                          currentUserBid.negotiateShipperPrice > 0 && (
                            <span className="max-h-10 text-red-800 text-sm">
                              Waiting for shipper response
                            </span>
                          )}
                        {currentUserBid?.isDriverAccepted === false &&
                          currentUserBid.negotiateDriverPrice > 0 &&
                          currentUserBid.negotiateShipperPrice > 0 && (
                            <Button
                              className="button-primary max-h-10"
                              onClick={() =>
                                handleBidStatus(currentUserBid.id, load.id)
                              }
                            >
                              Accept
                            </Button>
                          )}
                        {!currentUserBid && (
                          <>
                            <Button
                              className="button-primary max-h-10"
                              onClick={() =>
                                acceptBidWithoutBid(load.id, load.shipperId)
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              className="button-secondary max-h-10"
                              onClick={() => showBidModal(load)}
                            >
                              Bid
                            </Button>
                          </>
                        )}

                        {currentUserBid &&
                          currentUserBid.isDriverAccepted &&
                          currentUserBid.isShipperAccepted && (
                            <span className="max-h-10 text-green-800 text-sm">
                              Load accepted
                            </span>
                          )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {filteredLoads.length > PAGE_SIZE && (
            <div className="flex justify-center mt-6">
              <Button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </Button>
              <Text className="mx-4">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Modal
          title="Place a Bid"
          open={isModalVisible}
          onOk={() => handleBidSubmit(selectedLoad.id)}
          onCancel={() => setIsModalVisible(false)}
          okText="Submit Bid"
          cancelText="Cancel"
        >
          {selectedLoad && (
            <>
              <Text strong>
                {selectedLoad.origin.city} → {selectedLoad.destination.city}
              </Text>
              <br />
              <Text>Type: {selectedLoad.cargoType}</Text>
              <br />
              <Text>Weight: {selectedLoad.weight} Tons</Text>
              <br />
            </>
          )}
          <Form layout="vertical">
            <Form.Item label="Enter your Bid Price">
              <InputNumber
                value={Number(bidPrice)}
                onChange={(value) => setBidPrice(String(value))}
                placeholder="Enter amount"
                prefix="₹"
                parser={(value?: any) =>
                  value ? value.replace(/₹\s?|(,)/g, "") : "0"
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <Modal
        title={<p>Load Confirmation</p>}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        {Array.isArray(dataWithOutTrips) &&
          dataWithOutTrips.map((data: any) => {
            const loadId = data?.load?.id;
            const isExpanded = expandedLoadIds.includes(loadId);

            return (
              <div key={loadId} className="mb-4 border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <b>{data?.user?.email}</b> has confirmed you for the load
                    <br />
                    {data?.load?.origin?.city} → {data?.load?.destination?.city}
                  </div>

                  <Button
                    type="link"
                    icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => toggleExpand(loadId)}
                  >
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4">
                    <Radio.Group
                      onChange={(e) =>
                        setSelectedTrucks((prev) => ({
                          ...prev,
                          [loadId]: e.target.value,
                        }))
                      }
                      value={selectedTrucks[loadId] || null}
                    >
                      {activeVehicles && activeVehicles?.length > 0 ? (
                        activeVehicles?.map((vehicle, index) => {
                          return (
                            <div
                              className="box flex justify-between w-100 my-2"
                              key={index}
                            >
                              <p>
                                <span className="labelStyle">
                                  {vehicle.model}
                                </span>
                                <br />
                                <span className="valueStyle">
                                  {" "}
                                  {vehicle.registrationNumber}
                                </span>
                              </p>
                              <Radio value={vehicle.registrationNumber} />
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <Link href="/trucks">
                            <Button>ADD VEHICLE</Button>
                          </Link>
                        </>
                      )}
                    </Radio.Group>

                    <Button
                      type="primary"
                      className="mt-4"
                      onClick={() => handleConfirmLoad(data.load, data.bid)}
                      disabled={!selectedTrucks[loadId]}
                    >
                      Ok
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
      </Modal>
    </>
  );
};

export default Loads;
