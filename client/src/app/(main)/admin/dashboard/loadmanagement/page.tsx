"use client";
import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Space, Typography, Input } from "antd";
import { getLoads } from "@/state/api";
import Link from "next/link";

interface Location {
  city: string;
  state: string;
  postalCode: string;
}

interface Load {
  id: string;
  origin: Location;
  destination: Location;
  equipmentType: string;
  shipmentType: string;
  trucks: number;
  estPickup: string;
  estDelivery: string;
}

const ITEMS_PER_PAGE = 5;

export default function Posted() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [filtered, setFiltered] = useState<Load[]>([]);
  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const data = await getLoads();
        setLoads(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching loads", err);
      }
    };
    fetchLoads();
  }, []);

  useEffect(() => {
    const filteredLoads = loads.filter((load) => {
      return (
        load.origin.city.toLowerCase().includes(originFilter.toLowerCase()) &&
        load.destination.city
          .toLowerCase()
          .includes(destinationFilter.toLowerCase())
      );
    });
    setFiltered(filteredLoads);
    setCurrentPage(1); // reset to page 1 on filter
  }, [originFilter, destinationFilter, loads]);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const labelStyle = { fontWeight: 600, fontSize: 12, color: "#555" };
  const valueStyle = { fontSize: 14, fontWeight: 500 };

  return (
    <>
      <Row gutter={[16, 16]}>
        <h1 className="text-3xl  mb-4">Loads</h1>

        <Col span={24}>
          <Flex gap={12} style={{ marginBottom: 16 }}>
            <Input
              placeholder="Filter by origin city"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              style={{ maxWidth: 250 }}
            />
            <Input
              placeholder="Filter by destination city"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              style={{ maxWidth: 250 }}
            />
          </Flex>
        </Col>

        <Col span={24}>
          <Flex vertical style={{ width: "100%" }} gap={16}>
            {paginatedData.map((load) => (
              <Flex key={load.id}>
                <Col lg={24}>
                  <Flex
                    justify="space-between"
                    wrap="wrap"
                    style={{
                      border: "1px solid #E8E8E8",
                      borderRadius: 12,
                      padding: 20,
                      width: "100%",
                      rowGap: 12,
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Flex gap={8} align="center">
                      <Space>
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 31"
                          fill="none"
                        >
                          <circle cx="15" cy="15.5" r="15" fill="#E3E3E3" />
                          <circle cx="15" cy="15.5" r="5" fill="black" />
                        </svg>
                      </Space>
                      <Flex vertical>
                        <Typography.Text style={labelStyle}>
                          {load.origin.postalCode}
                        </Typography.Text>
                        <Typography.Text style={valueStyle}>
                          {load.origin.city}
                        </Typography.Text>
                      </Flex>
                    </Flex>

                    <Flex gap={8} align="center">
                      <Space>
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 31 31"
                          fill="none"
                        >
                          <rect width="30" height="30" fill="#E3E3E3" />
                          <rect
                            x="10"
                            y="10"
                            width="10"
                            height="10"
                            fill="black"
                          />
                        </svg>
                      </Space>
                      <Flex vertical>
                        <Typography.Text style={labelStyle}>
                          {load.destination.postalCode}
                        </Typography.Text>
                        <Typography.Text style={valueStyle}>
                          {load.destination.city}
                        </Typography.Text>
                      </Flex>
                    </Flex>

                    <Flex vertical>
                      <Typography.Text style={labelStyle}>
                        Equipment Type
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.equipmentType}
                      </Typography.Text>
                    </Flex>

                    <Flex vertical>
                      <Typography.Text style={labelStyle}>
                        Shipment Type
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.shipmentType}
                      </Typography.Text>
                    </Flex>

                    <Flex vertical>
                      <Typography.Text style={labelStyle}>
                        No of Trucks
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.trucks}
                      </Typography.Text>
                    </Flex>

                    <Flex vertical>
                      <Typography.Text style={labelStyle}>
                        Est Pickup
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.estPickup}
                      </Typography.Text>
                    </Flex>

                    <Flex vertical>
                      <Typography.Text style={labelStyle}>
                        Est Delivery
                      </Typography.Text>
                      <Typography.Text style={valueStyle}>
                        {load.estDelivery}
                      </Typography.Text>
                    </Flex>

                    <Link href={`/admin/dashboard/loadmanagement/${load.id}`}>
                      <Button
                        type="primary"
                        style={{ backgroundColor: "#8205AF" }}
                      >
                        View
                      </Button>
                    </Link>
                  </Flex>
                </Col>
              </Flex>
            ))}
          </Flex>
        </Col>
      </Row>

      {/* Custom Pagination Controls */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
