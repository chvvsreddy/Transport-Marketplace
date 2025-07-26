"use client";

import {
  Row,
  Col,
  Button,
  Typography,
  Form,
  Input,
  message,
  Upload,
  Checkbox,
  Flex,
  Spin,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import {
  createIndividualShipperDetails,
  getIndividualShipperDetails,
} from "@/state/api";
import Link from "next/link";

const { Title } = Typography;

const beforeUpload = (file: File) => {
  const isJpgOrPdf =
    file.type === "application/pdf" || file.type.startsWith("image/");
  if (!isJpgOrPdf) {
    message.error("You can only upload PDF or image files!");
    return Upload.LIST_IGNORE;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error("File must be smaller than 5MB!");
    return Upload.LIST_IGNORE;
  }
  return true;
};

interface Values {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  businessName: string;
  businessGST: string;
  aadhaarNumber: string;
  panNumber: string;
}
export default function IndividualShipperForm() {
  const [form] = Form.useForm();
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const user = await getIndividualShipperDetails(userId);
      console.log("user", user);
      if (user != null) {
        router.push("/login");
      }
    }
    checkUser();
  }, [router, userId]);

  async function uploadFileToS3(file: File): Promise<string> {
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
  const onFinish = async (values: Values) => {
    setLoading(true);
    try {
      const {
        address,
        city,
        state,
        country,
        postalCode,
        businessName,
        businessGST,
        aadhaarNumber,
        panNumber,
      } = values;

      if (!aadhaarNumber && !aadhaarFile) {
        return message.error(
          "Please provide Aadhaar Number or upload Aadhaar file."
        );
      }

      if (!panNumber && !panFile) {
        return message.error("Please provide PAN Number or upload PAN file.");
      }

      // Upload files if present
      let aadhaarUrl = "";
      let panUrl = "";

      if (aadhaarFile) {
        aadhaarUrl = await uploadFileToS3(aadhaarFile);
      }

      if (panFile) {
        panUrl = await uploadFileToS3(panFile);
      }

      const payload = {
        userId,
        address,
        city,
        state,
        country,
        postalCode,
        isBusiness,
        businessName: isBusiness ? businessName : null,
        businessGST: isBusiness ? businessGST : null,
        aadhaarNumber: aadhaarNumber || null,
        aadhaarUrl: aadhaarUrl || null,
        panNumber: panNumber || null,
        panUrl: panUrl || null,
      };

      const createAccount = await createIndividualShipperDetails(payload);

      if (createAccount?.id) {
        message.success("Shipper profile created successfully!");
        form.resetFields();
        setAadhaarFile(null);
        setPanFile(null);
        setIsBusiness(false);
      } else {
        message.error("Failed to create profile.");
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: 24,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 8,
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{ borderBottom: "1px solid #B0B0B0", marginBottom: 20 }}
        >
          <Link href="/">
            <Image
              src="/goodseva-logo.png"
              alt="Goodseva-logo"
              className="h-12 w-auto"
              width={100}
            />
          </Link>
          <Typography.Title level={2}>REGISTER</Typography.Title>
        </Flex>
        <Title level={3}>Create Individual Shipper Account</Title>

        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input placeholder="Enter your address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "City is required" }]}
              >
                <Input placeholder="Enter your city" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required" }]}
              >
                <Input placeholder="Enter your state" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: "Country is required" }]}
              >
                <Input placeholder="Enter your country" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[{ required: true, message: "Postal code is required" }]}
              >
                <Input placeholder="Enter postal code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Checkbox
              checked={isBusiness}
              onChange={(e) => setIsBusiness(e.target.checked)}
            >
              I am a business
            </Checkbox>
          </Form.Item>

          {isBusiness && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessName"
                  label="Business Name"
                  rules={[
                    { required: true, message: "Business name is required" },
                  ]}
                >
                  <Input placeholder="Enter business name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessGST"
                  label="Business GST"
                  rules={[
                    { required: true, message: "Business GST is required" },
                  ]}
                >
                  <Input placeholder="Enter GST number" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="aadhaarNumber" label="Aadhaar Number">
                <Input placeholder="Enter Aadhaar number (optional if uploading)" />
              </Form.Item>
              <Form.Item label="Upload Aadhaar (PDF/Image)">
                <Upload
                  beforeUpload={(file) => {
                    const isValid = beforeUpload(file);
                    if (isValid !== Upload.LIST_IGNORE) setAadhaarFile(file);
                    return false;
                  }}
                  maxCount={1}
                  showUploadList={{ showRemoveIcon: true }}
                  onRemove={() => setAadhaarFile(null)}
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="panNumber" label="PAN Number">
                <Input placeholder="Enter PAN number (optional if uploading)" />
              </Form.Item>
              <Form.Item label="Upload PAN (PDF/Image)">
                <Upload
                  beforeUpload={(file) => {
                    const isValid = beforeUpload(file);
                    if (isValid !== Upload.LIST_IGNORE) setPanFile(file);
                    return false;
                  }}
                  maxCount={1}
                  showUploadList={{ showRemoveIcon: true }}
                  onRemove={() => setPanFile(null)}
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Details
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
}
