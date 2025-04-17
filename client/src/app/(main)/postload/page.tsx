"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/util/UserContext";
import { useRouter } from "next/navigation";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Typography,
  Radio,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Image from "next/image";
import Lorryimg1 from "../../../../public/Lp3.png";
import "../../(styles)/Postload.css";

export default function PostLoad() {
  const { user } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const [activeGoodsType, setActiveGoodsType] = useState<number | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<number | null>(null);

  useEffect(() => {
    if (
      !user ||
      !(user.type === "SHIPPER_COMPANY" || user.type === "INDIVIDUAL_SHIPPER")
    ) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [user, router]);

  if (!authorized) return null;

  const Goods_Types = [
    { title: "Commodities - Lorry", example: "Ex: Grains, Coal, Cement" },
    { title: "Container", example: "Ex: Electronics, Clothing" },
    { title: "Liquid - Tanker", example: "Ex: Crude Oil, Chemicals" },
    { title: "Gas - Tanker", example: "Ex: Natural Gas, Propane" },
    {
      title: "Roll-on/Roll-off - Flatbed",
      example: "Ex: Cars, Heavy Machinery",
    },
    { title: "Project - Flatbed", example: "Ex: Complex Equipment" },
    { title: "Hazardous - SP Truck", example: "Ex: Chemicals, Explosives" },
    { title: "A/C Reefer", example: "Ex: Meats, Dairy" },
    { title: "Box Truck", example: "Ex: Mixed Goods" },
  ];

  return (
    <Flex vertical gap={20} style={{ padding: "24px" }}>
      <Typography.Title level={3}>Post a Load</Typography.Title>
      <Typography.Text className="sub-head">
        Upload invoice to autofill load details
      </Typography.Text>

      <Upload.Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        className="upload-container"
        maxCount={1}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="upload-text">Click or drag file to this area to upload</p>
        <p className="upload-subtext">PDF, Word, Image files. Max size: 10MB</p>
      </Upload.Dragger>

      <Form layout="vertical" style={{ marginTop: 32 }}>
        <Row gutter={24}>
          <Col lg={6}>
            <Form.Item label="From">
              <Input placeholder="Hyderabad" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="To">
              <Input placeholder="Vishakapatnam" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Weight">
              <Input suffix="Tons" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Date & Time">
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col lg={6}>
            <Form.Item label="Truck Load Type">
              <Input placeholder="Full/Part Truck Load" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="No. of Trucks">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Frequency (once in)">
              <Input suffix="Days" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Price Type">
              <Radio.Group className="radio-grp">
                <Radio.Button value="spot">Spot Price</Radio.Button>
                <Radio.Button value="your">Your Price</Radio.Button>
                <Radio.Button value="smart">Smart Bid</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Typography.Text className="section-title">
        Suggested Trucks
      </Typography.Text>
      <Row gutter={[16, 16]} justify="start">
        {["Open Truck", "Box Truck", "Refrigerator Truck"].map(
          (truck, index) => (
            <Col key={index} span={8}>
              <Button
                block
                onClick={() => setSelectedTruck(index)}
                className={`truck-suggestion-card ${
                  selectedTruck === index ? "active" : ""
                }`}
              >
                <div className="truck-suggestion-content">
                  <Image src={Lorryimg1} alt="truck" width={50} height={50} />
                  <Typography.Text className="truck-name">
                    {truck}
                  </Typography.Text>
                  <div className="truck-details">
                    <span>20T</span> <span>SXL</span> <span>20×8×8</span>
                  </div>
                </div>
              </Button>
            </Col>
          )
        )}
      </Row>

      <Typography.Text className="section-title">
        Goods Type - Truck
      </Typography.Text>
      <Flex wrap gap={15} style={{ marginBottom: 16 }}>
        {Goods_Types.map((g, i) => (
          <Button
            key={i}
            className={`materials-btn ${activeGoodsType === i ? "active" : ""}`}
            onClick={() => setActiveGoodsType(i)}
          >
            <Typography.Text strong style={{ fontSize: "14px" }}>
              {g.title}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
              {g.example}
            </Typography.Text>
          </Button>
        ))}
      </Flex>

      <Divider />

      <Row justify="end" gutter={16}>
        <Col>
          <Button id="saveAsDraftBtn">Save as Draft</Button>
        </Col>
        <Col>
          <Button id="postBtn" type="primary">
            Post
          </Button>
        </Col>
      </Row>
    </Flex>
  );
}
