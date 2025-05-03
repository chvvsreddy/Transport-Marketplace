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

const PAGE_SIZE = 10;

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

  const { socket } = useContext(SocketContext) || {};
  const router = useRouter();

  useEffect(() => {
    if (getLoggedUserFromLS().id) {
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

            const filteredByState = allData.filter(
              (load) =>
                load.origin.state?.trim().toLowerCase() ===
                  stateName.trim().toLowerCase() && load.status === "AVAILABLE"
            );
            setFilteredLoads(filteredByState);

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
    };

    fetchBidsAndSetInitialLoads();
  }, [allData]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleUpdatedBid = (updatedBid: Bid) => {
      message.success("new bid prices updated check it once");
      setBids((prevBids) => {
        const index = prevBids.findIndex((b) => b.id === updatedBid.id);
        if (index !== -1) {
          const updated = [...prevBids];
          updated[index] = updatedBid;
          return updated;
        } else {
          return [...prevBids, updatedBid];
        }
      });
    };

    socket.on("receiveUpdatedBidPrice", handleUpdatedBid);

    return () => {
      socket.off("receiveUpdatedBidPrice", handleUpdatedBid);
    };
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

      try {
        if (existingBid) {
          socket.emit("updateBidAmount", {
            bidId: existingBid.id,
            shipperId: userId,
            price: priceNum,
          });
        } else {
          await createBid({
            loadId: selectedLoad.id,
            userId,
            price: priceNum,
          });
        }
      } catch (error) {
        console.error("Failed to submit bid:", error);
      }

      setIsModalVisible(false);
      setBidPrice("");
    }
  };

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

  const getCurrentBidPrice = (
    loadId: string,
    shipperId: string
  ): number | null => {
    const userId = getLoggedUserFromLS().userId;

    const relevantBids = Bids.filter(
      (bid) => bid.loadId === loadId && bid.carrierId === userId
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return relevantBids.length > 0 ? relevantBids[0].price : null;
  };

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError || !allData)
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch Loads</div>
    );

  return (
    <>
      {location && (
        <div className="text-md text-gray-600 mt-5 mb-3">
          <strong>Current Location:</strong> {location.address}
        </div>
      )}

      <div className="py-4">
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
          <Empty description="No loads available in this route" />
        ) : (
          paginatedLoads.map((load) => {
            const bidPrice = getCurrentBidPrice(load.id, load.shipperId);

            const showBoth = load.bidPrice > 0 && load.price > 0;
            const showFixedOnly = load.bidPrice === 0 && load.price > 0;

            return (
              <div
                className="grid grid-cols-3 md:grid-cols-7 gap-4 border rounded-md p-2 mb-2 border-neutral-300"
                key={load.id}
              >
                <div className="col-span-2 md:col-span-2">
                  <div className="-mt-1">
                    <Text className="bg-green-200 p-1 px-2 text-sm rounded-l-md">
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

                {showBoth && (
                  <Text className="mr-10">
                    Shipper Price:
                    <span className="font-semibold">
                      <br />₹{load.price}
                    </span>
                    <br />
                    Current ongoing bidding price:
                    <span className="font-semibold">
                      <br />₹{bidPrice ?? "—"}
                    </span>
                  </Text>
                )}

                {showFixedOnly && (
                  <Text>
                    Fixed Price:
                    <span className="font-semibold">
                      <br />₹{load.price}
                    </span>
                  </Text>
                )}

                <div className="flex justify-end">
                  <Button
                    className="button-primary mr-2 max-h-10"
                    onClick={() => {}}
                  >
                    Accept
                  </Button>
                  {showBoth && (
                    <Button
                      className="button-secondary max-h-10"
                      onClick={() => showBidModal(load)}
                    >
                      Bid
                    </Button>
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

      {/* Bid Modal */}
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
