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
  const columns = [
    {
      title: "Trip ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: any) =>
        text ? new Date(text).toLocaleString() : "Not Started",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: any) =>
        text ? new Date(text).toLocaleString() : "Not Completed",
    },
    {
      title: "Distance (km)",
      dataIndex: "plannedRoute",
      key: "distance",
      render: (plannedRoute: any) =>
        plannedRoute ? plannedRoute.distance.toFixed(1) : "N/A",
    },
    {
      title: "Waypoints",
      dataIndex: "plannedRoute",
      key: "waypoints",
      render: (plannedRoute: any) => {
        if (plannedRoute && plannedRoute.waypoints.length > 0) {
          return plannedRoute.waypoints
            .map(
              (wp: any, index: any) =>
                `(${wp.lat.toFixed(2)}, ${wp.lng.toFixed(2)})`
            )
            .join(", ");
        }
        return "No Waypoints";
      },
    },
    {
      title: "Vehicle ID",
      dataIndex: "vehicleId",
      key: "vehicleId",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Trip Details</Title>
      <Table columns={columns} dataSource={tripsData} rowKey="id" />
    </div>
  );
}
