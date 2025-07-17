"use client";

import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import getTokenIdFromLs from "@/app/util/getTokenIdFromLS";
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
}
interface GoodsOption {
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

  const token = getTokenIdFromLs();
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

  const onFinish = async (values: VehicleFormValues) => {
    try {
      const vehicleTypeJson = {
        size: selectedGoodsTitle ?? "",
        type: values.truckType ?? "",
        acOption: values.acOption === "AC" ? "AC" : "Non-AC",
        trollyOption:
          values.trollyOption === "With Trolly"
            ? "With Trolly"
            : "Without Trolly",
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
        {
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
          ownerId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "form",
        {
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
          ownerId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    }
  };

  return (
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
                        activeGoodsType === i ? "2px solid #1677ff" : undefined,
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
                        activeGoodsType === i ? "2px solid #1677ff" : undefined,
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

      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  );
};

export default AddTruckForm;
