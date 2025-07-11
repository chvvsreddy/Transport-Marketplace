"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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
import Heading from "@/app/util/Heading";
import TextArea from "antd/es/input/TextArea";
import Shimmer from "../(components)/shimmerUi/Shimmer";

interface LocationData {
  results?: {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
    address_components?: unknown[];
  }[];
  status: string;
}

// Define types for the debounced function
type DebouncedFunction<T extends (...args: unknown[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};
// Debounce function utility
const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): DebouncedFunction<F> => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced as DebouncedFunction<F>;
};

export default function PostLoad() {
  const [priceType, setPriceType] = useState<string>("FixPrice");
  const [originPincode, setOriginPincode] = useState("");
  const [destinationPincode, setDestinationPincode] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [originLocation, setOriginLocation] = useState<LocationData | null>(
    null
  );
  const [destinationLocation, setDestinationLocation] =
    useState<LocationData | null>(null);

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [form] = Form.useForm();

  const [activeGoodsType, setActiveGoodsType] = useState<number | null>(null);
  const [selectedTruckType, setSelectedTruckType] = useState<string>("Open");
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced API call with cleanup
  const fetchLocation = useCallback(
    debounce((pin: string, setFn: (val: LocationData) => void) => {
      if (pin.length === 6 && /^\d+$/.test(pin)) {
        const locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pin}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        fetch(locationUrl)
          .then((res) => res.json())
          .then((data) => setFn(data));
      }
    }, 1000),
    []
  );

  useEffect(() => {
    fetchLocation(originPincode, setOriginLocation);
    return () => fetchLocation.cancel();
  }, [originPincode]);

  useEffect(() => {
    fetchLocation(destinationPincode, setDestinationLocation);
    return () => fetchLocation.cancel();
  }, [destinationPincode]);

  const Goods_Types: any = useMemo(
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
  useLayoutEffect(() => {
    const userObj = getLoggedUserFromLS();
    console.log("step 1 : ", userObj);
    if (
      !userObj ||
      !(
        userObj?.type === "SHIPPER_COMPANY" ||
        userObj?.type === "INDIVIDUAL_SHIPPER"
      )
    ) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
    console.log("step 2 : ", userObj);
  }, [router]);

  const acOptionValue = useWatch("acOption", form);
  const trollyOptionValue = useWatch("trollyOption", form);
  useEffect(() => {
    setIsLoading(false);
  }, []);

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
      shipperId: getLoggedUserFromLS()?.userId,
      origin: {
        city: values.fromCity,
        lat: "",
        lng: "",
        state: values.originState,
        address: values.originAddress,
        country: "India",
        postalCode: values.fromPin,
      },
      destination: {
        city: values.toCity,
        lat: "",
        lng: "",
        state: values.destinationState,
        address: values.destinationAddress,
        country: "India",
        postalCode: values.toPin,
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
      price: values.price,
      bidPrice: priceType === "FixPrice" ? 0 : values.price,
      noOfTrucks: values.noOfTrucks,
      pickupWindowStart: values.pickupDate,
      pickupWindowEnd: values.pickupDate,
      deliveryWindowStart: values.deliveryDate,
      deliveryWindowEnd: values.deliveryDate,
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

  return isLoading ? (
    <Shimmer />
  ) : (
    <>
      <Heading name="Post a Load" />
      <div className="main-content">
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
          <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-6">
            Origin & Destination Details
          </h2>
          <div className="box mb-6 !mt-0">
            <Row gutter={24}>
              <Col lg={12}>
                <Form.Item
                  label="Origin Pin code"
                  name="fromPin"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Postal Code",
                    },
                  ]}
                >
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      value={originPincode}
                      onChange={(e: any) =>
                        setOriginPincode(e.target.value.replace(/\D/g, ""))
                      } // Allow only numbers
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                </Form.Item>
                <Form.Item
                  label="Origin City"
                  name="fromCity"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Origin city",
                    },
                  ]}
                >
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="City Name"
                      value={
                        originLocation?.results?.[0]?.address_components?.find(
                          (c: any) => c.types.includes("locality")
                        )?.long_name || originCity
                      }
                      onChange={(e) => setOriginCity(e.target.value)}
                    />
                  </div>
                </Form.Item>
                <Form.Item
                  label="Origin Address"
                  name="originAddress"
                  rules={[
                    { required: true, message: "Please enter origin address" },
                  ]}
                >
                  <TextArea placeholder="Street address" />
                </Form.Item>
                <Form.Item name="multiplePickups" valuePropName="checked">
                  <Checkbox>Multiple Pickups</Checkbox>
                </Form.Item>
              </Col>
              <Col lg={12}>
                <Form.Item
                  label="Destination Pin code"
                  name="toPin"
                  rules={[
                    {
                      required: true,
                      message: "Please enter destination Pincode",
                    },
                  ]}
                >
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      value={destinationPincode}
                      name="postalCodeTo"
                      onChange={(e: any) =>
                        setDestinationPincode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                </Form.Item>
                <Form.Item
                  label="Destination City"
                  name="toCity"
                  rules={[
                    {
                      required: true,
                      message: "Please enter destination city",
                    },
                  ]}
                >
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="City Name"
                      value={
                        destinationLocation?.results?.[0]?.address_components?.find(
                          (c: any) => c.types.includes("locality")
                        )?.long_name || destinationCity
                      }
                      onChange={(e) => setDestinationCity(e.target.value)}
                    />
                  </div>
                </Form.Item>
                <Form.Item
                  label="Destination Address"
                  name="destinationAddress"
                  rules={[
                    {
                      required: true,
                      message: "Please enter destination address",
                    },
                  ]}
                >
                  <TextArea placeholder="Street address" />
                </Form.Item>

                <Form.Item name="multipleDrops" valuePropName="checked">
                  <Checkbox>Multiple Drops</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
          {/* Shipment Details */}
          <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">
            Shipment Details
          </h2>
          <div className="box mb-6 !mt-0">
            <Row gutter={24}>
              <Col lg={6}>
                <Form.Item
                  label="Pickup date"
                  name="pickupDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select a Pickup date/time",
                    },
                  ]}
                >
                  <DatePicker showTime style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col lg={6}>
                <Form.Item
                  label="Delivery date"
                  name="deliveryDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select a Estimated delivery date/time",
                    },
                  ]}
                >
                  <DatePicker showTime style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col lg={6}>
                <Form.Item
                  label="Load Type"
                  name="loadType"
                  rules={[
                    { required: true, message: "Please enter load type" },
                  ]}
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
          </div>
          {/* Truck Details */}
          <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">
            Truck Details
          </h2>
          <div className="box mb-6 !mt-0">
            <Row gutter={24}>
              <Col lg={12}>
                <Form.Item
                  label="Truck Type"
                  name="truckType"
                  rules={[
                    { required: true, message: "Please select truck type" },
                  ]}
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
                          activeGoodsType === i
                            ? "2px solid #1677ff"
                            : undefined,
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
                  {Goods_Types.Container["With Trolly"].map(
                    (g: any, i: number) => (
                      <Button
                        key={i}
                        className={`materials-btn ${
                          activeGoodsType === i ? "active" : ""
                        }`}
                        onClick={() => setActiveGoodsType(i)}
                        style={{
                          border:
                            activeGoodsType === i
                              ? "2px solid #1677ff"
                              : undefined,
                        }}
                      >
                        <Typography.Text strong style={{ fontSize: "14px" }}>
                          {g.title}
                        </Typography.Text>
                      </Button>
                    )
                  )}
                </Flex>
              )}
          </div>
          <Row justify="end" gutter={16}>
            <Col>
              <Button className="button-secondary">Save as Draft</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                className="button-primary"
              >
                Post
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}
