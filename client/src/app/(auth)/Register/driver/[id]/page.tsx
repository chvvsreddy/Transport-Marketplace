"use client";
import "@ant-design/v5-patch-for-react-19";

import type { RcFile } from "antd/es/upload/interface";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Space,
  Typography,
  Steps,
  Spin,
} from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  createIndividualDriverDetails,
  getIndividualDriverDetails,
  getSingleVehicleBtOwnerId,
} from "@/state/api";
import { DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AddTruckForm from "@/app/(main)/(components)/AddTruckForm";

export default function Step3() {
  const params = useParams();
  const userId = params?.id as string;

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getData() {
      const response = await getIndividualDriverDetails(userId);
      const singleVehicle = await getSingleVehicleBtOwnerId(userId);

      if (response != null) {
        setCurrentStep(1);
      }
      if (singleVehicle != null && response != null) {
        return router.push("/login");
      }
    }
    getData();
  }, [userId]);

  async function uploadToS3(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const { url } = await res.json();
    return url;
  }

  const handleDriverSubmit = async (values: any) => {
    setLoading(true);
    try {
      const licenseFrontFile = values.licenseFront?.[0]
        ?.originFileObj as RcFile;
      const licenseBackFile = values.licenseBack?.[0]?.originFileObj as RcFile;
      const insuranceDocFile = values.insuranceDoc?.[0]
        ?.originFileObj as RcFile;

      const licenseFrontUrl = licenseFrontFile
        ? await uploadToS3(licenseFrontFile)
        : "";
      const licenseBackUrl = licenseBackFile
        ? await uploadToS3(licenseBackFile)
        : "";
      const insuranceDocUrl = insuranceDocFile
        ? await uploadToS3(insuranceDocFile)
        : "";

      const payload = {
        userId,
        licenseNumber: values.licenseNumber,
        licenseExpiry: values.licenseExpiry.toISOString(),
        insuranceNumber: values.insuranceNumber,
        insuranceExpiry: values.insuranceExpiry.toISOString(),
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        licenseFrontUrl,
        licenseBackUrl,
        insuranceDocUrl,
      };

      const res = await createIndividualDriverDetails(payload);

      if (!res.id) {
        setLoading(false);
        throw new Error("Submission failed");
      }

      message.success("Driver details submitted successfully!");
      setCurrentStep(1); // Go to Step 2
    } catch (err) {
      console.error(err);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        {/* Header */}
        <Row>
          <Col span={24} style={{ backgroundColor: "black", color: "white" }}>
            <Flex justify="center" align="middle">
              <Space style={{ padding: 10 }}>
                <span>📞 +91 864 6444 2222</span>
              </Space>
              <Space style={{ padding: 10 }}>
                <span>✉️ info@suvega.com</span>
              </Space>
            </Flex>
          </Col>
        </Row>
        <h2
          style={{
            color: "#d32f2f",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          ⚠️ Important: At least one vehicle must be added to proceed with
          onboarding.
        </h2>
        {/* Stepper */}
        <Row justify="center" style={{ marginTop: 24, marginLeft: 20 }}>
          <Steps current={currentStep} style={{ maxWidth: 600 }}>
            <Steps.Step title="Your Details" />
            <Steps.Step title="Vehicle Details" />
          </Steps>
        </Row>

        {/* Form Content */}
        <Row>
          <Col lg={4} sm={0}></Col>
          <Col lg={16} xs={24} style={{ padding: 24 }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ borderBottom: "1px solid #B0B0B0", marginBottom: 20 }}
            >
              <Link href="/">
                <img
                  src="/goodseva-logo.png"
                  alt="Goodseva-logo"
                  className="h-12 w-auto"
                />
              </Link>
              <Typography.Title level={2}>REGISTER</Typography.Title>
            </Flex>

            <Typography.Title
              level={5}
              style={{ textAlign: "center", fontWeight: 500 }}
            >
              {currentStep === 0
                ? "Please enter your driver details"
                : "Please enter your vehicle details"}
            </Typography.Title>

            {currentStep === 0 && (
              <Form layout="vertical" form={form} onFinish={handleDriverSubmit}>
                <Form.Item
                  name="licenseNumber"
                  label="License Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter license number",
                    },
                  ]}
                >
                  <Input placeholder="Enter license number" />
                </Form.Item>

                <Form.Item
                  name="licenseExpiry"
                  label="License Expiry"
                  rules={[
                    {
                      required: true,
                      message: "Please select license expiry date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="insuranceNumber"
                  label="Insurance Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter insurance number",
                    },
                  ]}
                >
                  <Input placeholder="Enter insurance number" />
                </Form.Item>

                <Form.Item
                  name="insuranceExpiry"
                  label="Insurance Expiry"
                  rules={[
                    {
                      required: true,
                      message: "Please select insurance expiry date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="emergencyContactName"
                  label="Emergency Contact Name"
                  rules={[
                    { required: true, message: "Please enter contact name" },
                  ]}
                >
                  <Input placeholder="Enter emergency contact name" />
                </Form.Item>

                <Form.Item
                  name="emergencyContactPhone"
                  label="Emergency Contact Phone"
                  rules={[
                    {
                      required: true,
                      message: "Please enter contact phone number",
                    },
                  ]}
                >
                  <Input placeholder="Enter emergency contact phone number" />
                </Form.Item>

                <Form.Item
                  name="licenseFront"
                  label="Upload License Front"
                  rules={[
                    {
                      required: true,
                      message: "Please upload license front image",
                    },
                  ]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".png,.jpg,.jpeg,.pdf"
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload License Front
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="licenseBack"
                  label="Upload License Back"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".png,.jpg,.jpeg,.pdf"
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload License Back
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="insuranceDoc"
                  label="Upload Insurance Document"
                  rules={[
                    {
                      required: true,
                      message: "Please upload insurance document",
                    },
                  ]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".png,.jpg,.jpeg,.pdf"
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload Insurance Document
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit Driver Profile
                  </Button>
                </Form.Item>

                {/* Repeat all fields from your existing form... */}
                {/* Submit */}
                <Form.Item
                  style={{
                    float: "right",
                  }}
                >
                  <Button
                    htmlType="submit"
                    style={{ color: "white", backgroundColor: "brown" }}
                  >
                    Continue to Vehicle Details
                  </Button>
                </Form.Item>
              </Form>
            )}

            {currentStep === 1 && (
              <>
                <Typography.Title level={4}>Vehicle Details</Typography.Title>
                <AddTruckForm />
              </>
            )}
          </Col>
          <Col lg={4} sm={0}></Col>
        </Row>
      </div>
    </Spin>
  );
}
