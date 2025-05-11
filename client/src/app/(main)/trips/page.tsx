"use client";
import React from "react";
import { Table, Typography } from "antd";

const { Title } = Typography;

const tripsData = [
  {
    id: "trp_1a2b",
    loadId: "lod_1a2b",
    driverId: "usr_7g8h",
    vehicleId: "veh_1a2b",
    plannedRoute: {
      waypoints: [
        { lat: 28.6139, lng: 77.209 },
        { lat: 26.8467, lng: 80.9462 },
        { lat: 13.0827, lng: 80.2707 },
      ],
      distance: 2200.0,
    },
    status: "SCHEDULED",
    startTime: null,
    endTime: null,
  },
  {
    id: "trp_3c4d",
    loadId: "lod_3c4d",
    driverId: "usr_q7r8",
    vehicleId: "veh_3c4d",
    plannedRoute: {
      waypoints: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 17.385, lng: 78.4867 },
        { lat: 22.5726, lng: 88.3639 },
      ],
      distance: 1700.0,
    },
    status: "COMPLETED",
    startTime: "2023-06-05T09:00:00Z",
    endTime: "2023-06-07T13:00:00Z",
  },
  {
    id: "trp_5e6f",
    loadId: "lod_5e6f",
    driverId: "usr_w3x4",
    vehicleId: "veh_5e6f",
    plannedRoute: {
      waypoints: [
        { lat: 22.5726, lng: 88.3639 },
        { lat: 21.1458, lng: 79.0882 },
        { lat: 18.5204, lng: 73.8567 },
      ],
      distance: 1500.0,
    },
    status: "COMPLETED",
    startTime: "2023-06-10T10:00:00Z",
    endTime: "2023-06-12T08:00:00Z",
  },
  // More trips...
];

export default function Trips() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Trips page is in progress....</h1>
    </div>
  );
}
