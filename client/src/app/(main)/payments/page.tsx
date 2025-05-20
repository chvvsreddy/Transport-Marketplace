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

  const toggleTrip = (tripId: string) => {
    setExpandedTrips((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
  };

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
                className={`px-3 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap
                  ${
                    filter === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
        {!loading && data.length === 0 && (
          <p className="text-gray-500">No Transactions</p>
        )}

        {!loading &&
          data.map(({ trip, payments }, idx) => {
            const tripId = trip?.id ?? `no-trip-${idx}`;
            const filteredPayments = payments.filter((payment) => {
              if (filter === "All") return true;
              return payment.status.toLowerCase() === filter.toLowerCase();
            });

            if (filteredPayments.length === 0) {
              return null;
            }

            const isExpanded = expandedTrips[tripId] ?? false;

            return (
              <div
                key={tripId}
                className="mb-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm"
              >
                <button
                  onClick={() => toggleTrip(tripId)}
                  className="w-full px-4 py-3 flex justify-between items-center bg-white rounded-t-lg cursor-pointer"
                  aria-expanded={isExpanded}
                  aria-controls={`payments-list-${tripId}`}
                >
                  <span className="text-lg font-semibold text-gray-800">
                    Trip ID: {tripId === `no-trip-${idx}` ? "N/A" : tripId}
                  </span>
                  <span className="text-blue-600">
                    {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </button>

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
                          <p className="text-sm text-gray-500">
                            Transaction ID
                          </p>
                          <p className="text-base font-semibold text-gray-800">
                            {payment.transactionId || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-base font-semibold text-gray-800">
                            {payment.amount} {payment.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="text-base font-semibold text-gray-800">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p
                            className={`text-base font-semibold ${
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
                          <EyeOutlined className="text-blue-500 text-xl cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
