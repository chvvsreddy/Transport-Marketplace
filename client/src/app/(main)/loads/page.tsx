"use client";

import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Modal,
  Input,
  Form,
  Empty,
  InputNumber,
} from "antd";
import React, { useState, useEffect } from "react";
import Heading from "@/app/util/Heading/index";
import { useGetAllLoadsQuery } from "@/state/api";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";

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
}

const PAGE_SIZE = 3;

const Loads = () => {
  const { data, isLoading, isError } = useGetAllLoadsQuery();
  const allLoads = data as Load[] | undefined;
  const allData = allLoads || [];

  const [location, setLocation] = useState<Location | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [bidPrice, setBidPrice] = useState<string>("");

  useEffect(() => {
    const fetchLocationAndLoads = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        setFilteredLoads(allData.filter((load) => load.status === "AVAILABLE"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude: lat, longitude: lng } = position.coords;

            const geoRes = await fetch(
              `${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API}q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPEN_CAGE_MAP_API_KEY}`
            );
            const geoData = await geoRes.json();
            const formattedAddress = geoData?.results?.[0]?.formatted || "";
            const stateName = geoData?.results?.[0]?.components?.state || "";

            const updatedLocation: Location = {
              lat,
              lng,
              address: formattedAddress,
              state: stateName,
            };

            setLocation(updatedLocation);

            const filteredByOriginState =
              allData.filter(
                (load) =>
                  load.origin.state?.trim().toLowerCase() ===
                    stateName.trim().toLowerCase() &&
                  load.status === "AVAILABLE"
              ) ?? [];

            setFilteredLoads(filteredByOriginState);

            const payload = {
              driverUserId: getLoggedUserFromLS().userId,
              coordinates: updatedLocation,
            };

            const backendRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/driverLocation`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );

            if (!backendRes.ok) {
              console.error("Failed to update location on the server.");
            }
          } catch (err) {
            console.error("Error during location update:", err);
          }
        },
        (err) => {
          console.warn(
            "User denied geolocation or error occurred:",
            err.message
          );
          setFilteredLoads(
            allData.filter((load) => load.status === "AVAILABLE")
          );
        },
        { enableHighAccuracy: true }
      );
    };

    fetchLocationAndLoads();
  }, [allData]);

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

  const handleAction = (action: string, loadId: string) => {
    console.log(`${action} clicked for load ID: ${loadId}`);
  };

  const totalPages = Math.ceil(filteredLoads.length / PAGE_SIZE);
  const paginatedLoads = filteredLoads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const showBidModal = (load: Load) => {
    setSelectedLoad(load);
    setIsModalVisible(true);
  };

  const handleBidSubmit = () => {
    if (selectedLoad) {
      console.log(
        "Bid submitted for Load ID:",
        selectedLoad.id,
        "Bid Price:",
        bidPrice
      );
      setIsModalVisible(false);
    }
  };

  const handleBidCancel = () => {
    setIsModalVisible(false);
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !allData) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch Loads</div>
    );
  }

  return (
    <>
      <Heading name="Loads" />

      {location && (
        <div className="text-sm text-gray-600 mt-10 mb-2 px-2 ml-8 ">
          <strong>Current Location:</strong> {location.address}
        </div>
      )}

      <div className="p-4 m-6">
        <Row justify="space-between" align="middle" className="mb-4">
          <Title level={4}>Available Loads</Title>
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
            const showBid = load.bidPrice > 0;
            const showFixed = load.price > 0;

            return (
              <Card key={load.id} className="mb-4 shadow" variant="outlined">
                <Row justify="space-between" align="middle">
                  <Col span={20}>
                    <Title level={5}>
                      {load.origin.city} → {load.destination.city}
                    </Title>
                    <Text>Type: {load.cargoType}</Text>
                    <br />
                    <Text>Weight: {load.weight} Tons</Text>
                    <br />
                    <Text>Status: {load.status}</Text>
                    <br />
                    {showBid ? (
                      <Text strong>Bid Price: ₹{load.bidPrice}</Text>
                    ) : showFixed ? (
                      <Text strong>Fixed Price: ₹{load.price}</Text>
                    ) : (
                      <Text type="secondary">No price available</Text>
                    )}
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      onClick={() => handleAction("Accept", load.id)}
                    >
                      Accept
                    </Button>
                    {showBid && (
                      <Button onClick={() => showBidModal(load)}>Bid</Button>
                    )}
                    {showFixed && !showBid && (
                      <Button
                        danger
                        onClick={() => handleAction("Decline", load.id)}
                      >
                        Decline
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>
            );
          })
        )}

        {filteredLoads.length > PAGE_SIZE && (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
          >
            <Button onClick={handlePrev} disabled={currentPage === 1}>
              Prev
            </Button>
            <Text style={{ margin: "0 16px" }}>
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
        onCancel={handleBidCancel}
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
