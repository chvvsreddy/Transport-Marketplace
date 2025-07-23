import React, { useEffect, useState } from "react";
import {
  DriverDetails,
  Vehicle,
} from "../interfaces/AdminInterfaces/user.interface.admin";
import { User } from "./CompanyProfileCard";
import {
  Button,
  Card,
  Col,
  Image,
  message,
  Row,
  Select,
  Typography,
} from "antd";
import {
  updateUserProfileFromAdmin,
  updateUserVehicleFromAdmin,
} from "@/state/api";

const { Text, Title } = Typography;

interface DriverProfileCardProps {
  user: User;
  driverDetails: DriverDetails;
  vehicles: Vehicle[];
}

const isPDF = (url: string) => url.toLowerCase().endsWith(".pdf");

const renderFilePreview = (url: string) => {
  if (isPDF(url)) {
    return (
      <iframe
        src={url}
        title="Document Preview"
        width="100%"
        height="300px"
        style={{ border: "1px solid #ccc", borderRadius: 8 }}
      />
    );
  }

  return (
    <Image
      src={url}
      alt="Document"
      style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8 }}
    />
  );
};

export const DriverProfileCard: React.FC<DriverProfileCardProps> = ({
  user,
  driverDetails,
  vehicles,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    user.isVerified?.toString() || "false"
  );

  const [driverVerificationMap, setDriverVerificationMap] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const initialMap = vehicles.reduce((acc, veh) => {
      acc[veh.id] = veh.isDriverVerified ? "true" : "false";
      return acc;
    }, {} as Record<string, string>);

    setDriverVerificationMap(initialMap);
  }, [vehicles]);

  const { Option } = Select;
  const handleSubmit = async () => {
    const isVerified = selectedValue === "true";
    console.log("Submitting status:", isVerified);
    const updateProfile = await updateUserProfileFromAdmin({
      userId: user.id,
      isVerified,
    });
    console.log("updatedProfile", updateProfile);
    if (updateProfile.id) {
      message.success(
        `Request submitted: User marked as ${
          isVerified ? "Verified" : "Not Verified"
        }`
      );
    }
  };

  const handleVehicleStatusChange = (vehicleId: string, value: string) => {
    setDriverVerificationMap((prev) => ({
      ...prev,
      [vehicleId]: value,
    }));
  };

  const handleVehicleSubmit = async (vehicleId: string) => {
    const status = driverVerificationMap[vehicleId];
    const isDriverVerified = status === "true";

    const updatedVehicle = await updateUserVehicleFromAdmin({
      vehicleId,
      isDriverVerified,
    });

    if (updatedVehicle.id) {
      message.success(
        `Request submitted: User marked as ${
          isDriverVerified ? "Verified" : "Not Verified"
        }`
      );
    }
    // TODO: API call or form submission
    console.log(
      `Submit: vehicle ${vehicleId}, isDriverVerified = ${isDriverVerified}`
    );
    console.log(
      `Submit: vehicle ${vehicleId}, isDriverVerified = ${isDriverVerified},${updatedVehicle}`
    );
  };

  return (
    <>
      <Row
        gutter={[32, 32]}
        style={{
          margin: 30,
          padding: 30,
          borderRadius: 16,
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          position: "relative",
        }}
      >
        <Col span={24}>
          <Card title="Driver Profile" bordered={false}>
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Text strong>Id:</Text>
                <br />
                <Text>{driverDetails.id}</Text>
              </Col>

              <Col>
                <Row gutter={8} align="middle">
                  <Col>
                    <Text strong>Status:</Text>
                  </Col>
                  <Col>
                    <Select
                      value={selectedValue}
                      style={{ width: 150 }}
                      onChange={(value) => setSelectedValue(value)}
                    >
                      <Option value="true">Verified</Option>
                      <Option value="false">Not Verified</Option>
                    </Select>
                  </Col>
                  <Col>
                    <Button type="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Email:</Text>
                <br />
                <Text>{user?.email}</Text>
              </Col>

              <Col span={12}>
                <Text strong>License Number:</Text>
                <br />
                <Text>{driverDetails.licenseNumber}</Text>
              </Col>

              <Col span={12}>
                <Text strong>License Expiry:</Text>
                <br />
                <Text>
                  {new Date(driverDetails.licenseExpiry).toLocaleDateString()}
                </Text>
              </Col>

              <Col span={12}>
                <Text strong>Insurance Number:</Text>
                <br />
                <Text>{driverDetails.insuranceNumber}</Text>
              </Col>

              <Col span={12}>
                <Text strong>Insurance Expiry:</Text>
                <br />
                <Text>
                  {new Date(driverDetails.insuranceExpiry).toLocaleDateString()}
                </Text>
              </Col>

              <Col span={12}>
                <Text strong>Years of Experience:</Text>
                <br />
                <Text>{driverDetails.yearsOfExperience || "N/A"}</Text>
              </Col>

              <Col span={12}>
                <Text strong>Has Own Vehicle:</Text>
                <br />
                <Text>{driverDetails.hasOwnVehicle ? "Yes" : "No"}</Text>
              </Col>

              <Col span={24}>
                <Text strong>Preferred Routes:</Text>
                <br />
                <Text>
                  {driverDetails.preferredRoutes?.join(", ") || "N/A"}
                </Text>
              </Col>

              <Col span={24}>
                <Text strong>Current Location:</Text>
                <br />
                <Text>
                  {driverDetails.currentLocation
                    ? `${driverDetails.currentLocation.address} (${driverDetails.currentLocation.lat}, ${driverDetails.currentLocation.lng})`
                    : "N/A"}
                </Text>
              </Col>

              <Col span={12}>
                <Text strong>Emergency Contact Name:</Text>
                <br />
                <Text>{driverDetails.emergencyContactName}</Text>
              </Col>

              <Col span={12}>
                <Text strong>Emergency Contact Phone:</Text>
                <br />
                <Text>{driverDetails.emergencyContactPhone}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Document Section */}
        <Col span={24}>
          <Card title="Documents" bordered={false}>
            <Row gutter={[16, 32]}>
              <Col span={12}>
                <Title level={5}>License Front</Title>
                {renderFilePreview(driverDetails.licenseFrontUrl)}
                <br />
                <Button
                  type="link"
                  href={driverDetails.licenseFrontUrl}
                  download
                  target="_blank"
                >
                  Download
                </Button>
              </Col>

              {driverDetails.licenseBackUrl && (
                <Col span={12}>
                  <Title level={5}>License Back</Title>
                  {renderFilePreview(driverDetails.licenseBackUrl)}
                  <br />
                  <Button
                    type="link"
                    href={driverDetails.licenseBackUrl}
                    download
                    target="_blank"
                  >
                    Download
                  </Button>
                </Col>
              )}

              <Col span={12}>
                <Title level={5}>Insurance Document</Title>
                {renderFilePreview(driverDetails.insuranceDocUrl)}
                <br />
                <Button
                  type="link"
                  href={driverDetails.insuranceDocUrl}
                  download
                  target="_blank"
                >
                  Download
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          margin: 30,
          padding: 30,
          borderRadius: 16,
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          position: "relative",
        }}
      >
        {vehicles.length > 0 ? (
          vehicles.map((veh: Vehicle) => {
            const renderDocument = (url?: string, label?: string) => {
              if (!url) return <Text type="danger">No {label} uploaded</Text>;

              const isPDF = url.toLowerCase().endsWith(".pdf");

              return (
                <div style={{ marginTop: 10 }}>
                  <Text strong>{label}:</Text>
                  <br />
                  {isPDF ? (
                    <iframe
                      src={url}
                      title={label}
                      style={{
                        width: "100%",
                        height: 300,
                        border: "1px solid #ccc",
                      }}
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={label}
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                  <br />
                  <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button style={{ marginTop: 8 }} type="primary">
                      Download {label}
                    </Button>
                  </a>
                </div>
              );
            };

            return (
              <Col span={24} key={veh.id} style={{ marginTop: 10 }}>
                <Card
                  title={`Vehicle - ${veh.registrationNumber}`}
                  bordered={false}
                  extra={
                    <Col xs={24} lg={8} style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          top: -30,
                          right: 20,

                          backgroundColor:
                            driverVerificationMap[veh.id] === "true"
                              ? "#4CAF50"
                              : "#f44336",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "0 0 0 12px",
                          fontWeight: "bold",
                          zIndex: 10,
                        }}
                      >
                        {driverVerificationMap[veh.id] === "true"
                          ? "Verified"
                          : "Not Verified"}
                      </div>
                    </Col>
                  }
                >
                  <Row
                    justify="end"
                    align="middle"
                    gutter={16}
                    style={{ marginBottom: 16 }}
                  >
                    <Col>
                      <Select
                        value={driverVerificationMap[veh.id]}
                        style={{ width: 160 }}
                        onChange={(value) =>
                          handleVehicleStatusChange(veh.id, value)
                        }
                      >
                        <Option value="true">Verified</Option>
                        <Option value="false">Not Verified</Option>
                      </Select>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        onClick={() => handleVehicleSubmit(veh.id)}
                      >
                        Submit Request
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>Vehicle ID:</Text>
                      <br />
                      <Text>{veh.id}</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Registration Number:</Text>
                      <br />
                      <Text>{veh.registrationNumber}</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Make & Model:</Text>
                      <br />
                      <Text>
                        {veh.make} {veh.model} ({veh.year})
                      </Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Capacity:</Text>
                      <br />
                      <Text>{veh.capacity} kg</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Dimensions (L×W×H):</Text>
                      <br />
                      <Text>
                        {veh.dimensions.length} × {veh.dimensions.width} ×{" "}
                        {veh.dimensions.height} m
                      </Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Permit Type:</Text>
                      <br />
                      <Text>{veh.permitType || "N/A"}</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Insurance Number:</Text>
                      <br />
                      <Text>{veh.insuranceNumber}</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Insurance Expiry:</Text>
                      <br />
                      <Text>
                        {new Date(veh.insuranceExpiry).toLocaleDateString()}
                      </Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Fitness Certificate Expiry:</Text>
                      <br />
                      <Text>
                        {new Date(veh.fitnessCertExpiry).toLocaleDateString()}
                      </Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Driver Name:</Text>
                      <br />
                      <Text>{veh.driverName}</Text>
                    </Col>

                    <Col span={12}>
                      <Text strong>Contact:</Text>
                      <br />
                      <Text>
                        {veh.contact1}
                        {veh.contact2 ? `, ${veh.contact2}` : ""}
                      </Text>
                    </Col>

                    <Col span={24}>
                      <Text strong>Current Location:</Text>
                      <br />
                      <Text>
                        {veh.currentLocation?.address
                          ? `${veh.currentLocation.address} (${veh.currentLocation.lat}, ${veh.currentLocation.lng})`
                          : "N/A"}
                      </Text>
                    </Col>
                    <Col span={8}>
                      {renderDocument(veh.driverImage, "Driver Image")}
                    </Col>
                    <Col span={8}>
                      {renderDocument(veh.driverLicense, "Driver License")}
                    </Col>
                    <Col span={8}>
                      {renderDocument(veh.driverRC, "Registration Certificate")}
                    </Col>
                    <Col span={8}>
                      {renderDocument(veh.driverPAN, "PAN Card")}
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <Card bordered={false}>
              <Text type="warning" strong>
                No vehicles registered yet.
              </Text>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
};
