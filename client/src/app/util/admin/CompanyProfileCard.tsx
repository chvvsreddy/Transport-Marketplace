import { updateUserProfileFromAdmin } from "@/state/api";
import { Card, Col, Row, Typography, Select, Button, message } from "antd";
import { useState } from "react";

import { CompanyDetails } from "../interfaces/AdminInterfaces/user.interface.admin";

const { Text } = Typography;
const { Option } = Select;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  type: "INDIVIDUAL_DRIVER" | "INDIVIDUAL_SHIPPER" | "SHIPPER_COMPANY";
  phone: string;
  profilePic?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

const CompanyProfileCard: React.FC<{
  user: User;
  companyDetails: CompanyDetails;
}> = ({ user, companyDetails }) => {
  const [verificationStatus, setVerificationStatus] = useState(
    user.isVerified ? "true" : "false"
  );

  const handleSubmit = async () => {
    // You can send `verificationStatus` to your backend here
    console.log("Submit request clicked. New Status:", verificationStatus);

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
  };
  return (
    <>
      {user.type === "SHIPPER_COMPANY" ? (
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
            <Card title="Company Profile" variant="borderless">
              {/* ✅ Top-right Select + Submit Button */}
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
                    onChange={(value) => setVerificationStatus(value)}
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

              {/* 🧾 Company Info Grid */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Company Name:</Text>
                  <br />
                  <Text>{companyDetails?.companyName}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Legal Name:</Text>
                  <br />
                  <Text>{companyDetails?.legalName}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>City:</Text>
                  <br />
                  <Text>{companyDetails?.city}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>State:</Text>
                  <br />
                  <Text>{companyDetails?.state}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Country:</Text>
                  <br />
                  <Text>{companyDetails?.country}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Postal Code:</Text>
                  <br />
                  <Text>{companyDetails?.postalCode}</Text>
                </Col>

                <Col span={24}>
                  <Text strong>Address:</Text>
                  <br />
                  <Text>{companyDetails?.address}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Contact:</Text>
                  <br />
                  <Text>7575398786</Text>
                </Col>

                <Col span={12}>
                  <Text strong>GST Number:</Text>
                  <br />
                  <Text>{companyDetails?.gstNumber}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>PAN Number:</Text>
                  <br />
                  <Text>{companyDetails?.panNumber}</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row
          gutter={[32, 32]}
          style={{
            margin: 30,
            padding: 30,
            borderRadius: 16,
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Card variant="borderless">
            <Text type="warning" strong>
              Company details not added yet.
            </Text>
          </Card>
        </Row>
      )}
    </>
  );
};

export default CompanyProfileCard;
