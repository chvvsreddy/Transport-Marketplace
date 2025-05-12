"use client";

import {
  Card,
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
} from "antd";
import React, { useState, useEffect, useContext } from "react";
import Heading from "@/app/util/Heading/index";
import { createBid, getBids, useGetAllLoadsQuery } from "@/state/api";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { SocketContext } from "@/app/util/SocketContext";
import { useRouter } from "next/navigation";
import { timeSincePosted } from "@/app/util/timeSincePosted";
import { getStatusColor } from "@/app/util/statusColorLoads";

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
}

const PAGE_SIZE = 5;

const Loads = () => {
  const { data, isLoading, isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = allLoads || [];
  const [paginationHide, setPaginationHide] = useState(true);

  const [location, setLocation] = useState<Location | null>(null);
  const [Bids, setBids] = useState<Bid[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [bidPrice, setBidPrice] = useState<string>("");

  const { socket } = useContext(SocketContext) || {};
  const router = useRouter();

  useEffect(() => {
    if (getLoggedUserFromLS().userId) {
      if (getLoggedUserFromLS().type !== "INDIVIDUAL_DRIVER") {
        router.push("/login");
      }
    }

    const fetchBidsAndSetInitialLoads = async () => {
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
                `${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API}q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API_KEY}`
              );
              const geoData = await geoRes.json();
              const stateName = geoData?.results?.[0]?.components?.state || "";
              const address = geoData?.results?.[0]?.formatted || "";

              const updatedLocation: Location = {
                lat,
                lng,
                address,
                state: stateName,
              };
              setLocation(updatedLocation);

              if (selectedState) {
                const filtered = allData.filter(
                  (load) =>
                    load.origin.state?.trim().toLowerCase() ===
                    selectedState.trim().toLowerCase()
                );
                setFilteredLoads(filtered);
              }

              await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
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
  }, [allData]);

  useEffect(() => {
    if (socket) {
      const updateBidState = (updatedBid: Bid) => {
        message.success("price updated by Shipper");
        console.log(updatedBid);

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
            (load) => load.origin.state?.trim().toLowerCase() === trimmedValue
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

  const handleBidSubmit = async () => {
    if (selectedLoad && socket) {
      const userId = getLoggedUserFromLS()?.userId;
      const priceNum = Number(bidPrice);

      const existingBid = Bids.find(
        (bid) => bid.loadId === selectedLoad.id && bid.carrierId === userId
      );
      const findUserIdByLoad = allLoads?.find(
        (load) => load.id === existingBid?.loadId
      );
      const loggedUser = getLoggedUserFromLS();

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
        const newBid = await createBid({
          loadId: selectedLoad.id,
          userId,
          price: priceNum,
          negotiateDriverPrice: priceNum,
        });

        socket.emit("passNewBid", { newBid, toUser: selectedLoad.shipperId });
      }

      setIsModalVisible(false);
      setBidPrice("");
    }
    message.success("bid updated success");
    // window.location.reload();
  };

  const acceptBidWithoutBid = (bidId: string) => {
    //Directly create trip
  };

  //accept btn
  const handleBidStatus = async (bidId: string) => {
    const currentBid = Bids.find((bid) => bid.id === bidId);
    const findUserIdByLoad = allLoads?.find(
      (load) => load.id === currentBid?.loadId
    );
    socket?.emit("updateBidStatus", {
      bidId,
      shipperId: getLoggedUserFromLS().userId,
      toUser:
        getLoggedUserFromLS().type === "INDIVIDUAL_DRIVER"
          ? findUserIdByLoad?.shipperId
          : currentBid?.carrierId,
    });
  };

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError || !allData)
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch Loads</div>
    );

  const countOfBid = Bids.filter(
    (bid) => bid.carrierId === getLoggedUserFromLS().userId
  );

  return (
    <>
      {location ? (
        <div className="text-md text-gray-600 mt-5 mb-3">
          <strong>Current Location:</strong> {location.address}
        </div>
      ) : (
        <div className="text-md text-gray-600 mt-5 mb-3">
          <strong>Location not available</strong>
        </div>
      )}

      <div className="py-4">
        <Row>
          <Col span={24} md={12}>
            <Heading name="All Loads" />
          </Col>

          <Col span={24} md={12}>
            <div className="flex flex-wrap md:justify-end gap-2 mt-2 md:mt-0">
              <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
                <Title level={5} className="!mb-0 !text-base">
                  {allData.length} All
                </Title>
              </div>
              <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
                <Title level={5} className="!mb-0 !text-base">
                  {allData.length - countOfBid.length} Fixed Price
                </Title>
              </div>
              <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
                <Title level={5} className="!mb-0 !text-base">
                  {countOfBid.length < 10
                    ? `0${countOfBid.length}`
                    : countOfBid.length}{" "}
                  Bid Price
                </Title>
              </div>
            </div>
          </Col>
        </Row>
        <h1 className="text-xl font-semibold mt-2 text-gray-700">Your Bids</h1>
        {countOfBid.length === 0 ? (
          <Empty description="You have not placed any bids yet." />
        ) : (
          Bids.map((bid) => {
            const load = allData.find((l) => l.id === bid.loadId);
            if (!load) return null;
            const isBidLoad =
              load.bidPrice > 0 &&
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
                        {bid &&
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
                              Load accepted by shipper
                            </span>
                          )}

                        {bid.isDriverAccepted === false &&
                          bid.negotiateDriverPrice > 0 &&
                          bid.negotiateShipperPrice > 0 && (
                            <Button
                              className="button-primary max-h-10"
                              onClick={() => handleBidStatus(bid.id)}
                            >
                              Accept
                            </Button>
                          )}
                        {bid.negotiateDriverPrice == 0 &&
                          bid.negotiateShipperPrice == 0 && (
                            <>
                              <Button
                                className="button-primary max-h-10"
                                onClick={() => acceptBidWithoutBid(bid.id)}
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
                        {/* {bid.isDriverAccepted ||
                          (bid.negotiateDriverPrice > 0 && (
                            <span className=" max-h-10 text-red-800 text-sm">
                              Waiting for shipper response
                            </span>
                          ))}

                        {bid.negotiateShipperPrice > 0 && (
                          <Button
                            className="button-primary max-h-10"
                            onClick={() => {}}
                          >
                            Accept
                          </Button>
                        )}

                        {bid.negotiateShipperPrice == 0 ||
                          (bid.negotiateDriverPrice === 0 && (
                            <Button
                              className="button-secondary max-h-10"
                              onClick={() => showBidModal(load)}
                            >
                              Bid
                            </Button>
                          ))} */}
                      </>
                    )}
                  </div>
                </div>
              )
            );
          })
        )}
        <Row justify="space-between" align="middle" className="mb-4">
          <Heading name="Available Loads" />
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
            const currentUserBid: Bid | undefined = Bids.find(
              (bid) => bid.loadId === load.id
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
                  {isFixedLoad && (
                    <Button
                      className="button-primary max-h-10"
                      onClick={() => {}}
                    >
                      Accept
                    </Button>
                  )}
                  {isBidLoad && (
                    <>
                      {/* {(currentUserBid?.isDriverAccepted ||
                        (currentUserBid?.negotiateDriverPrice ?? 0) > 0) && (
                        <span className="max-h-10 text-red-800 text-sm">
                          Waiting for shipper response
                        </span>
                      )} */}

                      {/* {(!currentUserBid ||
                        (currentUserBid?.negotiateShipperPrice ?? 0) > 0) && (
                        <Button
                          className="button-primary max-h-10"
                          onClick={() => {}}
                        >
                          Accept
                        </Button>
                      )} */}

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
                            onClick={() => handleBidStatus(currentUserBid.id)}
                          >
                            Accept
                          </Button>
                        )}
                      {!currentUserBid && (
                        <>
                          <Button
                            className="button-primary max-h-10"
                            onClick={() => handleBidStatus(load.id)}
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
                            Load accepted by shipper
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
            <Button onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>

      <Modal
        title="Place a Bid"
        open={isModalVisible}
        onOk={handleBidSubmit}
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
    </>
  );
};

export default Loads;
