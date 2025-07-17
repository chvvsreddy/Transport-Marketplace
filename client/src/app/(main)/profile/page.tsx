"use client";

import React from "react";
import { Col, Row } from "antd";
import Heading from "@/app/util/Heading";
import ProfileDetails from "@/app/util/Profile/ProfileDetails";

export default function Profile() {
  return (
    <>
      <Heading name="Profile" />
      <div className="bg-white p-4 m-4 rounded-xl shadow-md mt-4">
        <Row>
          <Col lg={24}>
            <ProfileDetails />
          </Col>
        </Row>
      </div>
    </>
  );
}
