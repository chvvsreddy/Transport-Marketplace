"use client";

import React, { useEffect, useState } from "react";
import Heading from "@/app/util/Heading";
import { Col, DatePicker, Row, Typography } from "antd";
import { EyeOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { getLoadBidPaymentTripByUserId } from "../../../state/api";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import Shimmer from "../(components)/shimmerUi/Shimmer";

export interface Payment {
  id: string;
  orderId?: string | null;
  tripId?: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface LoadBidTripPayment {
  load: any;
  bid: any | null;
  trip: any | null;
  payments: Payment[];
}

export default function Payments() {
  const { Text } = Typography;

  const [data, setData] = useState<LoadBidTripPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [expandedTrips, setExpandedTrips] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const userId = getLoggedUserFromLS().userId;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const result = await getLoadBidPaymentTripByUserId({ userId });
        setData(result || []);
      } catch (err: any) {
        setError("Failed to load payments.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPayments();
  }, [userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const toggleTrip = (tripId: string) => {
    setExpandedTrips((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

  const filteredData = data.filter(({ payments }) =>
    filter === "All"
      ? true
      : payments.some(
          (payment) => payment.status.toLowerCase() === filter.toLowerCase()
        )
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <>
      <Row className="pr-4">
        <Col span={24} md={6}>
          <Heading name="Payments" />
        </Col>
        <Col span={24} md={18}>
          <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
            {["All", "Pending", "Completed"].map((type) => (
              <div
                key={type}
                onClick={() => setFilter(type as typeof filter)}
                className={`page-filter-tabs cursor-pointer ${
                  filter === type ? "active" : ""
                }`}
              >
                {type}
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <div className="main-content px-4">
        <div className="flex gap-4 mb-4">
          <DatePicker.RangePicker />
        </div>

        {loading && (
          <div className="text-gray-600">
            <Shimmer />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && paginatedData.length === 0 && (
          <p className="text-gray-500">No Transactions</p>
        )}

        {!loading &&
          paginatedData.map(({ load, trip, payments }, idx) => {
            const tripId = trip?.id ?? `no-trip-${idx}`;
            const filteredPayments = payments.filter((payment) => {
              if (filter === "All") return true;
              return payment.status.toLowerCase() === filter.toLowerCase();
            });

            if (filteredPayments.length === 0) return null;

            const isExpanded = expandedTrips[tripId] ?? false;

            return (
              <div
                key={tripId}
                className="mb-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="p-2 px-4 flex justify-between items-center flex-col md:flex-row">
                  <p className="valueStyle">
                    {load.origin.city} ➝ {load.destination.city}
                  </p>
                  <p>
                    <span className="labelStyle">Load ID</span>
                    <br />
                    <span className="valueStyle">{load.id}</span>
                  </p>
                  <p>
                    <span className="labelStyle">Trip ID</span>
                    <br />
                    <span className="valueStyle">
                      {tripId === `no-trip-${idx}` ? "N/A" : tripId}
                    </span>
                  </p>
                  <button
                    onClick={() => toggleTrip(tripId)}
                    aria-expanded={isExpanded}
                    aria-controls={`payments-list-${tripId}`}
                  >
                    <span className="text-blue-600">
                      {isExpanded ? (
                        <>
                          Hide Transactions <UpOutlined />
                        </>
                      ) : (
                        <>
                          Show Transactions <DownOutlined />
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {isExpanded && (
                  <div
                    id={`payments-list-${tripId}`}
                    className="p-4 space-y-4 bg-white rounded-b-lg"
                  >
                    {filteredPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-y-4 shadow-sm"
                      >
                        <div>
                          <p className="labelStyle">Transaction ID</p>
                          <p className="valueStyle">
                            {payment.transactionId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="labelStyle">Amount</p>
                          <p className="valueStyle">
                            {payment.amount} {payment.currency}
                          </p>
                        </div>
                        <div>
                          <p className="labelStyle">Time</p>
                          <p className="valueStyle">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="labelStyle">Status</p>
                          <p
                            className={`valueStyle ${
                              payment.status === "Completed"
                                ? "text-green-600"
                                : payment.status === "Pending"
                                ? "text-yellow-600"
                                : "text-gray-800"
                            }`}
                          >
                            {payment.status}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <EyeOutlined className="icon-button" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <Text className="mx-4">
              Page {currentPage} of {totalPages}
            </Text>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
