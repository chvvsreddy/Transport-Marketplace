"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Divider, Tag, Avatar, Typography } from "antd";
import { fetchTrucksById } from "@/state/api";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import {
  CarOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Vehicle } from "@/app/util/interfaces/AdminInterfaces/user.interface.admin";

const { Title, Text } = Typography;

const ViewTrucks = () => {
  const [trucks, setTrucks] = useState([]);

  const fetchTrucks = async () => {
    const trucksAll = await fetchTrucksById({
      ownerId: getLoggedUserFromLS().userId,
    });
    setTrucks(trucksAll);
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  return (
    <div className="p-4">
      <Title level={3} className="text-lg md:text-xl mb-4">
        Your Vehicles
      </Title>

      <div className="grid gap-6 md:grid-cols-2">
        {trucks.map((truck: Vehicle) => (
          <Card
            key={truck.id}
            variant="outlined"
            className="shadow-sm"
            title={
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-sm md:text-base font-medium">
                  🚛 {truck.registrationNumber} — {truck.model}
                </span>
                <Tag
                  color={truck.isActive ? "red" : "green"}
                  className="mt-1 md:mt-0"
                >
                  {truck.isActive ? "Inactive" : "active"}
                </Tag>
              </div>
            }
          >
            <Row gutter={[12, 12]}>
              {/* Vehicle Info */}
              <Col span={24}>
                <Divider orientation="left" plain>
                  <CarOutlined /> Vehicle Details
                </Divider>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Make:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">{truck.make}</Text>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Year:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">{truck.year}</Text>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Capacity:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">{truck.capacity} kg</Text>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Type:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">
                  {truck.vehicleType?.size}, {truck.vehicleType?.type},{" "}
                  {truck.vehicleType?.acOption},{" "}
                  {truck.vehicleType?.trollyOption}
                </Text>
              </Col>

              {/* Driver Info */}
              <Col span={24}>
                <Divider orientation="left" plain>
                  <UserOutlined /> Driver Info
                </Divider>
              </Col>
              <Col span={6}>
                <Avatar
                  src={truck.driverImage}
                  size={64}
                  icon={<UserOutlined />}
                  className="object-cover"
                />
              </Col>
              <Col span={18}>
                <Text className="text-xs md:text-sm" strong>
                  Name:
                </Text>{" "}
                {truck.driverName}
                <br />
                <Text className="text-xs md:text-sm" strong>
                  Contact:
                </Text>{" "}
                {truck.contact1}
                {truck.contact2 && `, ${truck.contact2}`}
                <br />
                <Text className="text-xs md:text-sm" strong>
                  License:
                </Text>{" "}
                <a
                  href={truck.driverLicense}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-all"
                >
                  View
                </a>
                <br />
                <Text className="text-xs md:text-sm" strong>
                  RC:
                </Text>{" "}
                <a
                  href={truck.driverRC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-all"
                >
                  View
                </a>
                <br />
                <Text className="text-xs md:text-sm" strong>
                  PAN:
                </Text>{" "}
                <a
                  href={truck.driverPAN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-all"
                >
                  View
                </a>
              </Col>

              {/* Additional Info */}
              <Col span={24}>
                <Divider orientation="left" plain>
                  <SafetyCertificateOutlined /> Insurance & Verification
                </Divider>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Insurance No:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">
                  {truck.insuranceNumber}
                </Text>
              </Col>
              <Col span={12}>
                <Text className="text-xs md:text-sm" strong>
                  Permit:
                </Text>
                <br />
                <Text className="text-xs md:text-sm">
                  {truck.permitType || "N/A"}
                </Text>
              </Col>
              <Col span={12}>
                <Tag
                  color={truck.isVehicleVerified ? "green" : "default"}
                  className="text-xs"
                >
                  Vehicle {truck.isVehicleVerified ? "Verified" : "Unverified"}
                </Tag>
              </Col>
              <Col span={12}>
                <Tag
                  color={truck.isDriverVerified ? "green" : "default"}
                  className="text-xs"
                >
                  Driver {truck.isDriverVerified ? "Verified" : "Unverified"}
                </Tag>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewTrucks;
