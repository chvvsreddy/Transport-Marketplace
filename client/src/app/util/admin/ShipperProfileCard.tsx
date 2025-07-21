import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Select,
  Tag,
  message,
} from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { User } from "./CompanyProfileCard";
import { IndividualShipperDetails } from "../interfaces/AdminInterfaces/user.interface.admin";
import { updateUserProfileFromAdmin } from "@/state/api";

const { Text } = Typography;
const { Option } = Select;

interface Props {
  user: User;
  shipperDetails: IndividualShipperDetails;
}

const ShipperProfileCard: React.FC<Props> = ({ user, shipperDetails }) => {
  const [verificationStatus, setVerificationStatus] = useState<
    "true" | "false"
  >(user.isVerified ? "true" : "false");

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    // Replace with actual API call or prop method
    const updateProfile = await updateUserProfileFromAdmin({
      userId: user.id,
      isVerified: verificationStatus === "true" ? true : false,
    });
    console.log("updatedProfile", updateProfile);
    if (updateProfile.id) {
      message.success(
        `Request submitted: User marked as ${
          verificationStatus === "true" ? "Verified" : "Not Verified"
        }`
      );
    }

    // TODO: Trigger backend update
  };

  return (
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
      <Card
        title="Shipper Profile"
        style={{ borderRadius: 16, width: "100%" }}
        bodyStyle={{ padding: 24 }}
      >
        <Row gutter={[16, 24]}>
          {/* Select Verified & Submit Button */}
          <Row
            justify="end"
            align="middle"
            gutter={16}
            style={{ marginBottom: 24 }}
          >
            <Col>
              <Select
                value={verificationStatus}
                style={{ width: 160 }}
                onChange={(value: "true" | "false") =>
                  setVerificationStatus(value)
                }
              >
                <Option value="true">Verified</Option>
                <Option value="false">Not Verified</Option>
              </Select>
            </Col>
            <Col>
              <Button type="primary" onClick={handleSubmit}>
                Submit Request
              </Button>
            </Col>
          </Row>

          {/* Aadhaar Section */}
          {shipperDetails.aadhaarUrl && (
            <Col span={24}>
              <Text strong>
                Aadhaar:{" "}
                <Tag color={verificationStatus === "true" ? "green" : "red"}>
                  {verificationStatus === "true" ? "Verified" : "Not Verified"}
                </Tag>
              </Text>
              <Space style={{ marginTop: 8 }}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => openInNewTab(shipperDetails.aadhaarUrl!)}
                >
                  View
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  href={shipperDetails.aadhaarUrl}
                  download
                  target="_blank"
                >
                  Download
                </Button>
              </Space>
            </Col>
          )}

          {/* PAN Section */}
          {shipperDetails.panUrl && (
            <Col span={24}>
              <Text strong>
                PAN:{" "}
                <Tag color={verificationStatus === "true" ? "green" : "red"}>
                  {verificationStatus === "true" ? "Verified" : "Not Verified"}
                </Tag>
              </Text>
              <Space style={{ marginTop: 8 }}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => openInNewTab(shipperDetails.panUrl!)}
                >
                  View
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  href={shipperDetails.panUrl}
                  download
                  target="_blank"
                >
                  Download
                </Button>
              </Space>
            </Col>
          )}

          {/* Business Info */}
          {shipperDetails.isBusiness && (
            <>
              <Col span={12}>
                <Text strong>Business Name:</Text>
                <div>{shipperDetails.businessName || "N/A"}</div>
              </Col>
              <Col span={12}>
                <Text strong>GST Number:</Text>
                <div>{shipperDetails.businessGST || "N/A"}</div>
              </Col>
            </>
          )}

          {/* Address and Location Info (moved to bottom) */}
          <Col span={12}>
            <Text strong>Address Name:</Text>
            <div>{shipperDetails.address || "N/A"}</div>
          </Col>
          <Col span={12}>
            <Text strong>City Name:</Text>
            <div>{shipperDetails.city || "N/A"}</div>
          </Col>
          <Col span={12}>
            <Text strong>State:</Text>
            <div>{shipperDetails.state || "N/A"}</div>
          </Col>
          <Col span={12}>
            <Text strong>Postal Code:</Text>
            <div>{shipperDetails.postalCode || "N/A"}</div>
          </Col>
          <Col span={12}>
            <Text strong>Country:</Text>
            <div>{shipperDetails.country || "N/A"}</div>
          </Col>
        </Row>
      </Card>
    </Row>
  );
};

export default ShipperProfileCard;
