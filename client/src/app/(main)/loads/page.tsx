"use client";

import {
  Row,
  Col,
  Button,
  Typography,
  Modal,
  InputNumber,
  Form,
  message,
  Radio,
  Spin,
} from "antd";
import React, {
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  useMemo,
} from "react";
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
import { useUser } from "@/app/util/UserContext";
import VerificationPending from "@/app/util/verification/verificationPending";

const { Title, Text } = Typography;

interface Requirements {
  size: string;
  type: string;
  acOption: string;
  trollyOption: string;
}

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

interface Vehicle {
  isVehicleVerified: boolean;
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
  vehicleType: Requirements;
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
  specialRequirements: Requirements;
  deliveryWindowEnd: string;
}

const PAGE_SIZE = 5;

const fetchNearbyLoads = async (currentLoc: Location, allLoads: Load[]) => {
  const origin = `${currentLoc.lat},${currentLoc.lng}`;
  const destinations = allLoads.map((load) => ({
    lat: load.origin.lat,
    lng: load.origin.lng,
  }));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/distance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ origin, destinations }),
  });

  const data = await res.json();
  return data;
};

const Loads = () => {
  const { data, isLoading, isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = useMemo(() => allLoads || [], [allLoads]);

  const [location, setLocation] = useState<Location | null>(null);
  const [Bids, setBids] = useState<Bid[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [bidPrice, setBidPrice] = useState<string>("");
  const [isLoadingSpin, setIsLoading] = useState(true);
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[] | undefined>();
  const [dataWithOutTrips, setDataForTrips] = useState<
    DataWithOutTrips[] | undefined
  >();
  const [loading, setLoading] = useState(true);
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
  const [hasFetchedNearbyLoads, setHasFetchedNearbyLoads] = useState(false);

  const { socket } = useContext(SocketContext) || {};
  const router = useRouter();
  const token = getTokenIdFromLs();
  const { isVerified } = useUser();

  useLayoutEffect(() => {
    if (getLoggedUserFromLS().userId) {
      if (getLoggedUserFromLS().type !== "INDIVIDUAL_DRIVER") {
        router.push("/login");
      }
    }

    const fetchInitialData = async () => {
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

      if (!navigator.geolocation) return;

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

              const addressComponents = geoData.results[0]
                .address_components as AddressComponent[];
              const stateComponent = addressComponents.find(
                (component: AddressComponent) =>
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
          } finally {
            setLoading(false);
          }
        },
        (err) => console.warn("Geolocation error:", err.message),
        { enableHighAccuracy: true }
      );
    };

    fetchInitialData();
    setIsLoading(false);
  }, [router, token]);

  useEffect(() => {
    const fetchNearby = async () => {
      if (!location || !allData || hasFetchedNearbyLoads) {
        setLoading(false);
        return;
      }

      try {
        const distanceData = await fetchNearbyLoads(location, allData);
        if (!distanceData?.rows?.[0]?.elements) return;

        const activeVehiclesById = await getActiveVehiclesByOwnerId({
          ownerId: getLoggedUserFromLS().userId,
        });

        const availableNearbyLoadsResults = await Promise.all(
          allData.map(async (load, index) => {
            const element = distanceData?.rows?.[0]?.elements?.[index];
            const distanceText = element?.distance?.text;
            const distanceValue = parseFloat(
              distanceText?.replace(" km", "") || "0"
            );

            const isVehicleAvailable = Array.isArray(activeVehiclesById)
              ? activeVehiclesById.some(
                  (vehicle: Vehicle) =>
                    vehicle.vehicleType?.size ===
                      load.specialRequirements?.size &&
                    vehicle.vehicleType?.type ===
                      load.specialRequirements?.type &&
                    vehicle.vehicleType.trollyOption ===
                      load.specialRequirements.trollyOption &&
                    vehicle.isVehicleVerified
                )
              : false;

            const isAvailable =
              load.status === "AVAILABLE" &&
              distanceValue <= 50 &&
              isVehicleAvailable;

            return isAvailable ? load : null;
          })
        );

        const filtered = availableNearbyLoadsResults.filter(
          (load): load is Load => load !== null
        );

        setFilteredLoads(filtered);
        setHasFetchedNearbyLoads(true);
      } catch (error) {
        console.error("fetchNearbyLoads error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location, allData, hasFetchedNearbyLoads, activeVehicles]);

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

  useEffect(() => {
    const updateLoad = (newLoad: Load) => {
      console.log("Updated allData:", newLoad);
      if (!allData.find((l) => l.id === newLoad.id)) {
        allData.unshift(newLoad);
        console.log("Updated allData:", allData);
      }
    };

    socket?.on("newLoadAvailable", updateLoad);

    return () => {
      socket?.off("newLoadAvailable", updateLoad);
    };
  }, [socket, allData]);

  if (!isVerified) {
    return <VerificationPending />;
  }

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const acceptBidWithoutBid = async (
    idOfLoad: string,
    loadShipperId: string
  ) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  //accept btn
  const handleBidStatus = async (bidId: string, loadId: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
      <Spin spinning={loading}>
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
          <div className={`bg-white pt-2 sm:m-4 rounded-xl mt-4 `}>
            {countOfBid.length > 0 && (
              <>
                <div className="s sm:m-4 rounded-xl shadow-md mt-4">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold mt-2 text-gray-700">
                      Your Bids
                    </h3>
                    <div className="bg-red-100 p-2 text-black rounded-md mb-2">
                      <b>{countOfBid.length} Carriers</b> from{" "}
                      <b>{Bids.length} Bids</b> Responded.
                    </div>
                  </div>

                  {Bids.map((bid) => {
                    const load: Load | undefined = allData.find(
                      (l) => l.id === bid.loadId
                    );
                    if (!load) return null;
                    const isBidLoad =
                      bid.carrierId === getLoggedUserFromLS().userId;
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
                                {bid.isDriverAccepted &&
                                  bid.isShipperAccepted && (
                                    <span className="max-h-10 text-green-800 text-sm">
                                      Load accepted
                                    </span>
                                  )}
                                {load.status === "ASSIGNED" &&
                                  !bid.isDriverAccepted &&
                                  !bid.isShipperAccepted && (
                                    <span className="max-h-10 text-red-800 text-sm">
                                      Bid closed!
                                    </span>
                                  )}
                                {load.status === "AVAILABLE" &&
                                  !bid.isDriverAccepted &&
                                  bid.negotiateDriverPrice > 0 &&
                                  bid.negotiateShipperPrice > 0 && (
                                    <Button
                                      className="button-primary max-h-10"
                                      onClick={() =>
                                        handleBidStatus(bid.id, load.id)
                                      }
                                    >
                                      Accept
                                    </Button>
                                  )}
                                {load.status === "ASSIGNED" &&
                                  !bid.isDriverAccepted &&
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
                                          acceptBidWithoutBid(
                                            load.id,
                                            load.shipperId
                                          )
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
                  })}
                </div>
              </>
            )}
            <div className="p-4">
              <Row justify="space-between" align="middle" className="mb-4">
                <h3 className="text-xl font-semibold mt-2 text-gray-700">
                  Available Loads
                </h3>
              </Row>

              {paginatedLoads.length === 0 ? (
                <>
                  <div className="text-center py-10">
                    <div className="text-4xl mb-2">📦</div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      No Loads Available Nearby
                    </h3>
                    <p className="text-sm text-gray-500">
                      Try again later or expand your search radius.
                    </p>
                  </div>
                </>
              ) : (
                paginatedLoads.map((load) => {
                  const isBidLoad = load.bidPrice > 0;
                  const isFixedLoad = load.bidPrice === 0 && load.price > 0;
                  const currentUserBid: Bid | undefined = Bids.find(
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
          </div>

          <Modal
            title="Place a Bid"
            open={isModalVisible}
            onOk={() => {
              if (selectedLoad) {
                handleBidSubmit(selectedLoad.id);
              }
            }}
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
                  parser={(value?: string) =>
                    value ? Number(value.replace(/₹\s?|(,)/g, "")) : 0
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
        <Modal
          title={<p className="text-base font-semibold">Load Confirmation</p>}
          open={open}
          footer={null}
          onCancel={() => setOpen(false)}
          bodyStyle={{
            maxHeight: "70vh",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          {Array.isArray(dataWithOutTrips) &&
            dataWithOutTrips.map((data: any) => {
              const loadId = data?.load?.id;
              const isExpanded = expandedLoadIds.includes(loadId);

              return (
                <div key={loadId} className="mb-4 border rounded-lg p-3">
                  {/* Header with Email and Route Info */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="text-sm">
                      <b>{data?.user?.email}</b> has confirmed you for the load
                      <br />
                      <span>
                        {data?.load?.origin?.city} →{" "}
                        {data?.load?.destination?.city}
                      </span>
                    </div>
                    <Button
                      type="link"
                      icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => toggleExpand(loadId)}
                      className="p-0 text-blue-600"
                    >
                      {isExpanded ? "Hide Details" : "Show Details"}
                    </Button>
                  </div>

                  {/* Expandable Vehicle List */}
                  {isExpanded && (
                    <div className="mt-4">
                      <Radio.Group
                        className="w-full flex flex-col gap-2"
                        onChange={(e) =>
                          setSelectedTrucks((prev) => ({
                            ...prev,
                            [loadId]: e.target.value,
                          }))
                        }
                        value={selectedTrucks[loadId] || null}
                      >
                        {activeVehicles && activeVehicles.length > 0 ? (
                          activeVehicles.map((vehicle, index) => {
                            const isCorrectVehicle =
                              data.load.specialRequirements.size ===
                                vehicle.vehicleType.size &&
                              data.load.specialRequirements.type ===
                                vehicle.vehicleType.type &&
                              data.load.specialRequirements.acOption ===
                                vehicle.vehicleType.acOption &&
                              data.load.specialRequirements.trollyOption ===
                                vehicle.vehicleType.trollyOption &&
                              vehicle.isVehicleVerified;

                            return (
                              isCorrectVehicle && (
                                <div
                                  key={index}
                                  className="w-full flex justify-between items-center border rounded-md p-2"
                                >
                                  <div className="text-sm">
                                    <span className="font-semibold block">
                                      {vehicle.model}
                                    </span>
                                    <span className="text-gray-600">
                                      {vehicle.registrationNumber}
                                    </span>
                                  </div>
                                  <Radio value={vehicle.registrationNumber} />
                                </div>
                              )
                            );
                          })
                        ) : (
                          <div className="text-center my-2">
                            <Link href="/trucks">
                              <Button type="primary" size="small">
                                Add Vehicle
                              </Button>
                            </Link>
                          </div>
                        )}
                      </Radio.Group>

                      <Button
                        type="primary"
                        className="mt-4 w-full"
                        onClick={() => handleConfirmLoad(data.load, data.bid)}
                        disabled={!selectedTrucks[loadId]}
                      >
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </Modal>
      </Spin>
    </>
  );
};

export default Loads;
