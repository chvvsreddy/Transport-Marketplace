"use client";
import dynamic from "next/dynamic";
import React from "react";
import { Col, Row, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import Header from "@/app/util/Header";
import Heading from "@/app/util/Heading";

const UserProfile = dynamic(() => import("../../util/Profile/ProfileDetails"));

export default function Profile() {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Company Details",
      children: <UserProfile />,
    },
    {
      key: "2",
      label: "Vehicles",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "SubScription",
      children: "Content of Tab Pane 3",
    },
    {
      key: "4",
      label: "Reviews",
      children: "Content of Tab Pane 4",
    },
  ];
  return (
    <div>
      <div style={{ margin: 10 }}>
        <Heading name="Profile" />

        <Row>
          <Col lg={20}>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          </Col>
        </Row>
      </div>
    </div>
  );
}
