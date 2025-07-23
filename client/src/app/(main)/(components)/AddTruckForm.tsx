"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";

import {
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Space,
  Row,
  Col,
  Radio,
  Flex,
  Typography,
  Upload,
  Spin,
} from "antd";
import axios from "axios";
import OpenVan from "../../../../public/vehicles/miniOpenVan.png";
import CloseVan from "../../../../public/vehicles/miniClosedVan.png";
import tanker from "../../../../public/vehicles/tanker.png";
import container from "../../../../public/vehicles/container.png";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import Image from "next/image";
import { GoodsTypes } from "../postload/page";
import { UploadOutlined } from "@ant-design/icons";

import type { UploadChangeParam, UploadFile } from "antd/es/upload/interface";
import { VehiclePayload } from "@/app/util/interfaces/vehiclePayload";
import { useParams } from "next/navigation";

interface VehicleFormValues {
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  capacity: string;
  length: string;
  width: string;
  height: string;
  truckType: string;
  acOption?: string;
  trollyOption?: string;
  insuranceNumber: string;
  insuranceExpiry: dayjs.Dayjs;
  fitnessCertExpiry: dayjs.Dayjs;
  permitType?: string;
  driverName: string;
  driverImage?: UploadFile[];
  contact1: string;
  contact2?: string;
  driverLicense: UploadFile[];
  driverRC: UploadFile[];
  driverPAN: UploadFile[];
}

export interface GoodsOption {
  title: string;
}
const AddTruckForm = () => {
  const [form] = Form.useForm();
  const [selectedTruckType, setSelectedTruckType] = useState<string>("Open");
  const [trollyOptionValue, setTrollyOptionValue] =
    useState<string>("With Trolly");
  const [activeGoodsType, setActiveGoodsType] = useState<number | null>(null);
  const [selectedGoodsTitle, setSelectedGoodsTitle] = useState<string | null>(
    null
  );
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const userId = getLoggedUserFromLS()?.userId;

  const Goods_Types: GoodsTypes = useMemo(
    () => ({
      Open: [
        { title: "17-24 FT" },
        { title: "10 Wheel" },
        { title: "12 Wheel" },
        { title: "14 Wheel" },
      ],
      Closed: [
        { title: "17-24 FT" },
        { title: "10 Wheel" },
        { title: "12 Wheel" },
        { title: "14 Wheel" },
      ],
      Tanker: [],
      Container: {
        "With Trolly": [
          { title: "20 Feet" },
          { title: "22 Feet" },
          { title: "24 Feet" },
          { title: "32 Feet Single Axle" },
          { title: "32 Feet Multi Axle" },
          { title: "32 Feet Triple Axle" },
        ],
        "Without Trolly": [],
      },
    }),
    []
  );

  const uploadFileToS3 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data?.url || null;
    } catch (err) {
      console.error("Upload failed", err);
      return null;
    }
  };

  const normFile = (e: UploadChangeParam | UploadFile[]): UploadFile[] => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async (values: VehicleFormValues) => {
    setLoading(true);
    try {
      const driverImageFile = values.driverImage?.[0]?.originFileObj;
      const driverRCFile = values.driverRC?.[0]?.originFileObj;
      const driverPANFile = values.driverPAN?.[0]?.originFileObj;
      const driverLicenseFile = values.driverLicense?.[0]?.originFileObj;

      const userIdForOption = params?.id as string;
      const [driverImageUrl, driverRCUrl, driverPANUrl, driverLicenseUrl] =
        await Promise.all([
          driverImageFile ? uploadFileToS3(driverImageFile) : null,
          driverRCFile ? uploadFileToS3(driverRCFile) : null,
          driverPANFile ? uploadFileToS3(driverPANFile) : null,
          driverLicenseFile ? uploadFileToS3(driverLicenseFile) : null,
        ]);
      const vehicleTypeJson = {
        size: selectedGoodsTitle ?? "",
        type: values.truckType ?? "",
        acOption: values.acOption === "AC" ? "AC" : "Non-AC",
        trollyOption:
          values.trollyOption === "With Trolly"
            ? "With Trolly"
            : "Without Trolly",
      };

      const payload: VehiclePayload = {
        registrationNumber: values.registrationNumber,
        make: values.make,
        model: values.model,
        year: parseInt(values.year, 10),
        capacity: parseFloat(values.capacity),
        dimensions: {
          length: parseFloat(values.length),
          width: parseFloat(values.width),
          height: parseFloat(values.height),
        },
        vehicleType: vehicleTypeJson,
        insuranceNumber: values.insuranceNumber,
        insuranceExpiry: values.insuranceExpiry.format("YYYY-MM-DD"),
        fitnessCertExpiry: values.fitnessCertExpiry.format("YYYY-MM-DD"),
        permitType: values.permitType || null,
        ownerId: userId === "no user" ? userIdForOption : userId,
        driverName: values.driverName,
        contact1: values.contact1,
        contact2: values.contact2 || null,
        driverImage: driverImageUrl ?? "",
        driverLicense: driverLicenseUrl ?? "",
        driverRC: driverRCUrl ?? "",
        driverPAN: driverPANUrl ?? "",
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
        payload
      );
      message.success("Truck added successfully!");
      form.resetFields();
      setSelectedGoodsTitle(null);
      setActiveGoodsType(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || "Server error");
      } else {
        message.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Registration Number"
          name="registrationNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Make" name="make" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Model" name="model" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Year" name="year" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Capacity (Kg)"
          name="capacity"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>

        <div className="box mb-6">
          <Row gutter={24}>
            <Col lg={12}>
              <Form.Item
                label="Truck Type"
                name="truckType"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  onChange={(e) => {
                    setSelectedTruckType(e.target.value);
                    setActiveGoodsType(null);
                    setSelectedGoodsTitle(null);
                  }}
                >
                  <Radio.Button value="Open">
                    <Image src={OpenVan} alt="Open" height={40} />
                    Open
                  </Radio.Button>
                  <Radio.Button value="Closed">
                    <Image src={CloseVan} alt="Closed" height={40} />
                    Closed
                  </Radio.Button>
                  <Radio.Button value="Tanker">
                    <Image src={tanker} alt="Tanker" height={40} />
                    Tanker
                  </Radio.Button>
                  <Radio.Button value="Container">
                    <Image src={container} alt="Container" height={40} />
                    Container
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col lg={6}>
              <Form.Item label="AC / Non AC" name="acOption">
                <Radio.Group
                  buttonStyle="solid"
                  disabled={selectedTruckType !== "Closed"}
                >
                  <Radio.Button value="Non AC">Non AC</Radio.Button>
                  <Radio.Button value="AC">AC</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col lg={6}>
              <Form.Item label="Trolly Option" name="trollyOption">
                <Radio.Group
                  buttonStyle="solid"
                  disabled={selectedTruckType !== "Container"}
                  onChange={(e) => setTrollyOptionValue(e.target.value)}
                >
                  <Radio.Button value="With Trolly">With Trolly</Radio.Button>
                  <Radio.Button value="Without Trolly">
                    Without Trolly
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Goods Types */}
          {["Open", "Closed"].includes(selectedTruckType) &&
            Goods_Types[selectedTruckType as "Open" | "Closed"].length > 0 && (
              <Flex wrap gap={15} style={{ marginBottom: 16 }}>
                {Goods_Types[selectedTruckType as "Open" | "Closed"].map(
                  (g: GoodsOption, i: number) => (
                    <Button
                      key={i}
                      onClick={() => {
                        setActiveGoodsType(i);
                        setSelectedGoodsTitle(g.title);
                      }}
                      style={{
                        border:
                          activeGoodsType === i
                            ? "2px solid #1677ff"
                            : undefined,
                      }}
                    >
                      <Typography.Text strong>{g.title}</Typography.Text>
                    </Button>
                  )
                )}
              </Flex>
            )}

          {selectedTruckType === "Container" &&
            trollyOptionValue === "With Trolly" && (
              <Flex wrap gap={15} style={{ marginBottom: 16 }}>
                {Goods_Types.Container["With Trolly"].map(
                  (g: GoodsOption, i: number) => (
                    <Button
                      key={i}
                      onClick={() => {
                        setActiveGoodsType(i);
                        setSelectedGoodsTitle(g.title);
                      }}
                      style={{
                        border:
                          activeGoodsType === i
                            ? "2px solid #1677ff"
                            : undefined,
                      }}
                    >
                      <Typography.Text strong>{g.title}</Typography.Text>
                    </Button>
                  )
                )}
              </Flex>
            )}
        </div>

        <Form.Item label="Dimensions (m)" required>
          <Space.Compact block>
            <Form.Item name="length" rules={[{ required: true }]}>
              <Input placeholder="Length" />
            </Form.Item>
            <Form.Item name="width" rules={[{ required: true }]}>
              <Input placeholder="Width" />
            </Form.Item>
            <Form.Item name="height" rules={[{ required: true }]}>
              <Input placeholder="Height" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          label="Insurance Number"
          name="insuranceNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Insurance Expiry Date"
          name="insuranceExpiry"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          label="Fitness Certificate Expiry"
          name="fitnessCertExpiry"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item label="Permit Type" name="permitType">
          <Input />
        </Form.Item>

        <Form.Item
          label="Driver Name"
          name="driverName"
          rules={[{ required: true, message: "Please enter driver name" }]}
        >
          <Input placeholder="Enter driver's full name" />
        </Form.Item>

        <Form.Item
          label="Primary Contact"
          name="contact1"
          rules={[{ required: true, message: "Primary contact is required" }]}
        >
          <Input placeholder="Enter mobile number" />
        </Form.Item>

        <Form.Item label="Alternate Contact" name="contact2">
          <Input placeholder="Enter alternate contact (optional)" />
        </Form.Item>

        <Form.Item
          label="Driver Image"
          name="driverImage"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Please upload driver image" }]}
        >
          <Upload
            beforeUpload={() => false}
            accept=".jpg,.jpeg"
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Upload Image (JPEG)</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="RC"
          name="driverRC"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Please upload RC" }]}
        >
          <Upload
            beforeUpload={() => false}
            accept=".jpg,.jpeg,.pdf"
            maxCount={1}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Upload RC</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="PAN"
          name="driverPAN"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Please upload PAN" }]}
        >
          <Upload
            beforeUpload={() => false}
            accept=".jpg,.jpeg,.pdf"
            maxCount={1}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Upload PAN</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="driver License"
          name="driverLicense"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Please upload License" }]}
        >
          <Upload
            beforeUpload={() => false}
            accept=".jpg,.jpeg,.pdf"
            maxCount={1}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Upload Driver License</Button>
          </Upload>
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </Spin>
  );
};

export default AddTruckForm;
