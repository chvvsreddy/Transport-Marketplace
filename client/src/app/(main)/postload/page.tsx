"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Typography,
  Radio,
  Upload,
  Checkbox,
  message,
  Divider,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Image from "next/image";
import OpenVan from "../../../../public/vehicles/miniOpenVan.png";
import CloseVan from "../../../../public/vehicles/miniClosedVan.png";
import tanker from "../../../../public/vehicles/tanker.png";
import container from "../../../../public/vehicles/container.png";
import "../../(styles)/Postload.css";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { useWatch } from "antd/es/form/Form";
import { createLoad } from "@/state/api";

export default function PostLoad() {
  const [priceType, setPriceType] = useState<string>("FixPrice");

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [form] = Form.useForm();

  const [activeGoodsType, setActiveGoodsType] = useState<number | null>(null);
  const [selectedTruckType, setSelectedTruckType] = useState<string>("Open");
  const [postStatus, setPostStatus] = useState<string | null>(null);

  const Goods_Types: any = {
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
  };

  useEffect(() => {
    const userObj = getLoggedUserFromLS();
    if (
      !userObj ||
      !(
        userObj.type === "SHIPPER_COMPANY" ||
        userObj.type === "INDIVIDUAL_SHIPPER"
      )
    ) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const acOptionValue = useWatch("acOption", form);
  const trollyOptionValue = useWatch("trollyOption", form);

  const handlePost = async (values: any) => {
    let selectedGoods;

    if (
      selectedTruckType === "Container" &&
      trollyOptionValue === "With Trolly"
    ) {
      selectedGoods =
        Goods_Types.Container["With Trolly"][activeGoodsType ?? -1]?.title;
    } else {
      selectedGoods =
        Goods_Types[selectedTruckType][activeGoodsType ?? -1]?.title;
    }

    const payload = {
      shipperId: getLoggedUserFromLS().userId,
      origin: {
        city: values.from,
        lat: "",
        lng: "",
        state: values.originState,
        address: values.originAddress,
        country: "India",
        postalCode: values.originPostalCode,
      },
      destination: {
        city: values.to,
        lat: "",
        lng: "",
        state: values.destinationState,
        address: values.destinationAddress,
        country: "India",
        postalCode: values.destinationPostalCode,
      },
      weight: values.weight,
      dimensions: {},
      cargoType: values.loadType,
      specialRequirements: [
        ...(values.specialRequirements || []),
        selectedGoods ?? "",
        selectedTruckType ?? "",
        acOptionValue ?? "NO",
        trollyOptionValue ?? "NO",
      ],
      price: priceType === "FixPrice" ? values.price : 0,
      bidPrice: priceType === "smart" ? values.price : 0,
      noOfTrucks: values.noOfTrucks,
      pickupWindowStart: values.datetime,
      pickupWindowEnd: values.datetime,
      deliveryWindowStart: values.datetime,
      deliveryWindowEnd: values.datetime,
    };

    callCreateLoad(payload);
  };

  async function callCreateLoad(payload: any) {
    try {
      const load = await createLoad(payload);
      if (load) {
        message.success("Load posted successfully!");
        setPostStatus("✅ Load posted successfully!");
        form.resetFields();
        setActiveGoodsType(null);
        setSelectedTruckType("Open");
        setTimeout(() => setPostStatus(null), 4000);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong while posting the load.");
      setPostStatus("❌ Failed to post load.");
      setTimeout(() => setPostStatus(null), 4000);
    }
  }

  if (!authorized) return null;

  return (
    <Flex vertical gap={15}>
      <Typography.Title level={3}>Post a Load</Typography.Title>

      {/* Upload Section */}
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900 mb-3">
          Upload invoice to autofill load details
        </h2>

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
          <div>
            <p className="upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="upload-subtext">
              PDF, Word, Image files. Max size: 10MB
            </p>
          </div>
        </Upload.Dragger>

        <div className="bg-amber-50 p-2 text-sm mt-2 flex gap-3 rounded">
          <ul className="list-disc ml-4">
            <li>Please enter accurate invoice details to claim insurance.</li>
            <li>Total invoice amount should not exceed INR 50 lakhs.</li>
          </ul>
          <ul className="list-disc ml-4">
            <li>
              Insurance applicable for shipments with invoices up to INR 20
              lakhs.
            </li>
            <li>
              Ceramic, Batteries, and Chemicals items are not covered under
              insurance.
            </li>
          </ul>
        </div>
      </div>

      {/* Form Starts Here */}
      <Form
        layout="vertical"
        form={form}
        onFinish={handlePost}
        initialValues={{
          priceType: "FixPrice",
          acOption: "Non AC",
          trollyOption: "Without Trolly",
        }}
      >
        {/* Origin & Destination */}
        <h2 className="text-base/7 font-semibold text-gray-900 mb-3">
          Origin & Destination Details
        </h2>
        <Row gutter={24}>
          <Col lg={12}>
            <Form.Item
              label="From"
              name="from"
              rules={[{ required: true, message: "Please enter origin" }]}
            >
              <Input placeholder="Hyderabad" />
            </Form.Item>
            <Form.Item
              label="Origin State"
              name="originState"
              rules={[{ required: true, message: "Please enter origin state" }]}
            >
              <Input placeholder="Telangana" />
            </Form.Item>
            <Form.Item
              label="Origin Address"
              name="originAddress"
              rules={[
                { required: true, message: "Please enter origin address" },
              ]}
            >
              <Input placeholder="Street address" />
            </Form.Item>
            <Form.Item
              label="Origin Postal Code"
              name="originPostalCode"
              rules={[
                { required: true, message: "Please enter origin postal code" },
              ]}
            >
              <Input placeholder="500001" />
            </Form.Item>
            <Form.Item name="multiplePickups" valuePropName="checked">
              <Checkbox>Multiple Pickups</Checkbox>
            </Form.Item>
          </Col>
          <Col lg={12}>
            <Form.Item
              label="To"
              name="to"
              rules={[{ required: true, message: "Please enter destination" }]}
            >
              <Input placeholder="Vishakapatnam" />
            </Form.Item>
            <Form.Item
              label="Destination State"
              name="destinationState"
              rules={[
                { required: true, message: "Please enter destination state" },
              ]}
            >
              <Input placeholder="Andhra Pradesh" />
            </Form.Item>
            <Form.Item
              label="Destination Address"
              name="destinationAddress"
              rules={[
                { required: true, message: "Please enter destination address" },
              ]}
            >
              <Input placeholder="Street address" />
            </Form.Item>
            <Form.Item
              label="Destination Postal Code"
              name="destinationPostalCode"
              rules={[
                {
                  required: true,
                  message: "Please enter destination postal code",
                },
              ]}
            >
              <Input placeholder="530001" />
            </Form.Item>
            <Form.Item name="multipleDrops" valuePropName="checked">
              <Checkbox>Multiple Drops</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Shipment Details */}
        <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">
          Shipment Details
        </h2>
        <Row gutter={24}>
          <Col lg={6}>
            <Form.Item
              label="Date & Time"
              name="datetime"
              rules={[{ required: true, message: "Please select a date/time" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item
              label="Load Type"
              name="loadType"
              rules={[{ required: true, message: "Please enter load type" }]}
            >
              <Input placeholder="Agriculture, Apparel etc" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item
              label="No. of Trucks"
              name="noOfTrucks"
              rules={[
                { required: true, message: "Please enter no. of trucks" },
              ]}
            >
              <Input type="number" placeholder="1" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item
              label="Weight"
              name="weight"
              rules={[{ required: true, message: "Please enter weight" }]}
            >
              <Input suffix="Tons" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <Input type="number" placeholder="Enter price" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Price Type" name="priceType">
              <Radio.Group
                className="radio-grp"
                buttonStyle="solid"
                value={priceType}
                onChange={(e) => {
                  setPriceType(e.target.value);
                  form.setFieldValue("priceType", e.target.value);
                }}
              >
                <Radio.Button value="FixPrice">Fix Price</Radio.Button>
                <Radio.Button value="smart">Smart Bid</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {/* Truck Details */}
        <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">
          Truck Details
        </h2>
        <Row gutter={24}>
          <Col lg={12}>
            <Form.Item
              label="Truck Type"
              name="truckType"
              rules={[{ required: true, message: "Please select truck type" }]}
            >
              <Radio.Group
                onChange={(e) => {
                  setSelectedTruckType(e.target.value);
                  setActiveGoodsType(null);
                  form.setFieldValue("truckType", e.target.value);
                }}
              >
                <Radio.Button value="Open">
                  <Image src={OpenVan} alt="" height={40} />
                  Open
                </Radio.Button>
                <Radio.Button value="Closed">
                  <Image src={CloseVan} alt="" height={40} />
                  Closed
                </Radio.Button>
                <Radio.Button value="Tanker">
                  <Image src={tanker} alt="" height={40} />
                  Tanker
                </Radio.Button>
                <Radio.Button value="Container">
                  <Image src={container} alt="" height={40} />
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
          Goods_Types[selectedTruckType].length > 0 && (
            <Flex wrap gap={15} style={{ marginBottom: 16 }}>
              {Goods_Types[selectedTruckType].map((g: any, i: number) => (
                <Button
                  key={i}
                  className={`materials-btn ${
                    activeGoodsType === i ? "active" : ""
                  }`}
                  onClick={() => setActiveGoodsType(i)}
                  style={{
                    border:
                      activeGoodsType === i ? "2px solid #1677ff" : undefined,
                  }}
                >
                  <Typography.Text strong style={{ fontSize: "14px" }}>
                    {g.title}
                  </Typography.Text>
                </Button>
              ))}
            </Flex>
          )}

        {selectedTruckType === "Container" &&
          trollyOptionValue === "With Trolly" && (
            <Flex wrap gap={15} style={{ marginBottom: 16 }}>
              {Goods_Types.Container["With Trolly"].map((g: any, i: number) => (
                <Button
                  key={i}
                  className={`materials-btn ${
                    activeGoodsType === i ? "active" : ""
                  }`}
                  onClick={() => setActiveGoodsType(i)}
                  style={{
                    border:
                      activeGoodsType === i ? "2px solid #1677ff" : undefined,
                  }}
                >
                  <Typography.Text strong style={{ fontSize: "14px" }}>
                    {g.title}
                  </Typography.Text>
                </Button>
              ))}
            </Flex>
          )}

        <Divider />

        <Row justify="end" gutter={16}>
          <Col>
            <Button className="button-secondary">Save as Draft</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" className="button-primary">
              Post
            </Button>
          </Col>
        </Row>
      </Form>
    </Flex>
  );
}
