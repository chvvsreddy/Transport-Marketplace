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

const PAGE_SIZE = 10;

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
            const showBid = load.bidPrice > 0;
            const showFixed = load.price > 0;

            return (
        
                <div className="grid grid-cols-3 md:grid-cols-7 gap-4 border rounded-md p-2 mb-2 border-neutral-300"  key={load.id}>
                 
           
                    <div className="col-span-2 md:col-span-2">
                      <div className="col-span-1 md:col-span-5 -mt-1">
                        <Text className="bg-green-200 p-1 px-2 text-sm rounded-l-md">{load.status}</Text>
                        <Text className="bg-blue-200 p-1 px-2 text-sm rounded-r-md">Posted: 12Hours back</Text>
                      </div>
                    <Title level={5} className="mt-1! mb-0!">                    
                      {load.origin.city} → {load.destination.city}
                    </Title>
                    </div> 
                    <div className=" md:col-span-2">
                    <Text>Type:<span className="font-semibold"><br/>{load.cargoType}</span></Text>
                    </div>                
                    
                    
                    <Text>Weight:<span className="font-semibold"><br/>{load.weight} Tons</span></Text>
                    
                   
                   
                    {showBid ? (
                      <Text>Bid Price:<span className="font-semibold"><br/>₹{load.bidPrice}</span> </Text>
                    ) : showFixed ? (
                      <Text>Fixed Price: <span className="font-semibold"><br/>₹{load.price}</span></Text>
                    ) : (
                      <Text type="secondary">No price available</Text>
                    )}
                    <div className=" flex justify-end">
                    <Button className="button-primary mr-2 max-h-10" onClick={() => handleAction("Accept", load.id)}
                    >
                      Accept
                    </Button>
                    {showBid && (
                      <Button  className="button-secondary max-h-10" onClick={() => showBidModal(load)}>Bid</Button>
                    )}
                      </div>      
                </div>
         
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
