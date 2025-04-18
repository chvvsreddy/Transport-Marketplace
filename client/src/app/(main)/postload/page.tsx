"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Button, Col,DatePicker, Divider,Flex,Form,Input,Row,Typography,Radio,Upload, Checkbox,} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Image from "next/image";
import OpenVan from "../../../../public/vehicles/miniOpenVan.png";
import CloseVan from "../../../../public/vehicles/miniClosedVan.png";
import tanker from "../../../../public/vehicles/tanker.png";
import container from "../../../../public/vehicles/container.png";
import "../../(styles)/Postload.css";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import type { CheckboxProps } from 'antd';


export default function PostLoad() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });

  const [activeGoodsType, setActiveGoodsType] = useState<number | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<number | null>(null);


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
      setLoggedUser(userObj);
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  const Goods_Types = [
    { title: "17-24 FT" },
    { title: "10 Wheel" },
    { title: "12 Wheel"},
    { title: "14 Wheel"},
      //Container
    { title: "20 Feet"},
    { title: "22 Feet"},
    { title: "24 Feet"},
    { title: "32 Feet Single Axle"},
    { title: "32 Feet Multi Axle" },
    { title: "32 Feet Triple Axle" },
  ];

  const onChange: CheckboxProps['onChange'] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  return (
    <Flex vertical gap={15} >
      <Typography.Title level={3}>Post a Load</Typography.Title>
      <div>
      <h2 className="text-base/7 font-semibold text-gray-900 mb-3">Upload invoice to autofill load details</h2>

      <Upload.Dragger  name="file"  multiple={false} showUploadList={false} className="upload-container" maxCount={1} >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <div>
          <p className="upload-text">Click or drag file to this area to upload</p>
          <p className="upload-subtext">PDF, Word, Image files. Max size: 10MB</p>
        </div>
       
      </Upload.Dragger>
      <div className="bg-amber-50 p-2 text-sm mt-2 flex gap-3 rounded">
        <ul className="list-disc ml-4">
            <li>Please enter accurate invoice details to claim insurance.</li>
            <li>Total invoice amount should not exceed INR 50 lakhs.</li>
        </ul>
        <ul className="list-disc ml-4">
            <li>Please note insurance applicable for shipments with invoices upto INR 20 lakhs.</li>
            <li>Ceramic, Batteries, Chemicals items are not covered under insurance.</li>
        </ul>
    </div>
      </div>

      <Form layout="vertical" style={{ marginTop: 32 }}>
      <h2 className="text-base/7 font-semibold text-gray-900 mb-3">Origin & Destination Details</h2>  
      <Row gutter={24}>
          <Col lg={12}>
            <Form.Item label="From">
              <Input placeholder="Hyderabad" />
              <div className="mt-3">
              <Checkbox onChange={onChange}>Miltiple Pickups</Checkbox>
              </div>              
            </Form.Item>
            
          </Col>
          <Col lg={12}>
            <Form.Item label="To">
              <Input placeholder="Vishakapatnam" />
              <div className="mt-3">
              <Checkbox onChange={onChange}>Miltiple Drops</Checkbox>
              </div>  
            </Form.Item>
            
          </Col>

        </Row>
      <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">Shipment Details</h2>
        <Row gutter={24}>  
          <Col lg={6}>
            <Form.Item label="Date & Time">
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col lg={6}>
            <Form.Item label="Load Type">
              <Input placeholder="Agriculture, Appearal etc" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="No. of Trucks">
              <Input type="number" placeholder="1"/>
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Frequency (once in)">
              <Input suffix="Week" placeholder="1" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Weight">
              <Input suffix="Tons" />
            </Form.Item>
          </Col>
          <Col lg={6}>
            <Form.Item label="Price Type">
              <Radio.Group className="radio-grp"  defaultValue="FixPrice" buttonStyle="solid">
                <Radio.Button value="FixPrice" defaultChecked>Fix Price</Radio.Button>
                <Radio.Button value="smart">Smart Bid</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <h2 className="text-base/7 font-semibold text-gray-900 mb-3 mt-3">Truck Details</h2>
      <Row gutter={24}>  
          <Col lg={12}>
          <Form.Item label="Truck Type">
              <Radio.Group className="radio-grp"  defaultValue="Open">
                <Radio.Button value="Open" ><Image src={OpenVan} alt="" height={40} />Open </Radio.Button>
                <Radio.Button value="Closed"><Image src={CloseVan} alt="" height={40}/>Closed</Radio.Button> 
                <Radio.Button value="Tanker"><Image src={tanker} alt="" height={40}/>Tanker</Radio.Button>
                <Radio.Button value="Container"><Image src={container} alt="" height={40}/>Container</Radio.Button>
              </Radio.Group>
            </Form.Item>
            </Col>
          <Col lg={6}>
          <Form.Item label="" >
              <Radio.Group className="radio-grp"  defaultValue="AC" buttonStyle="solid" disabled>
                <Radio.Button value="Non AC">Non AC</Radio.Button>
                <Radio.Button value="AC">AC</Radio.Button>                
              </Radio.Group>
            </Form.Item></Col>
          <Col lg={6}>
          <Form.Item label="" >
              <Radio.Group className="radio-grp"  defaultValue="With Trolly" buttonStyle="solid" disabled>
                <Radio.Button value="With Trolly">With Trolly</Radio.Button>
                <Radio.Button value="Without Trolly" >Without Trolly</Radio.Button>                
              </Radio.Group>
            </Form.Item>
            </Col>
          <Col lg={6}></Col>
      </Row>
      <Flex wrap gap={15} style={{ marginBottom: 16 }}>
        {Goods_Types.map((g, i) => (
          <Button key={i} className={`materials-btn ${activeGoodsType === i ? "active" : ""}`} onClick={() => setActiveGoodsType(i)} >
            <Typography.Text strong style={{ fontSize: "14px" }}>
              {g.title}
            </Typography.Text>
          </Button>
        ))}
      </Flex>

      <Divider />

      <Row justify="end" gutter={16}>
        <Col>
          <Button className="button-secondary">Save as Draft</Button>
        </Col>
        <Col>
          <Button type="primary" className="button-primary">Post</Button>
        </Col>
      </Row>
    </Flex>
  );
}
