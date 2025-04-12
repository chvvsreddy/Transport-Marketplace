"use client";

import { Button, Col, Divider, Flex, Row, Typography } from "antd";
import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/util/UserContext";

export default function ProfileDetails() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const getUserFromLocal: any = localStorage.getItem("token");
    const loggedUser = JSON.parse(getUserFromLocal);
    if (!loggedUser) {
      router.push("/login");
    }
  }, []);

  if (!user) {
    return (
      <Row style={{ padding: 25 }}>
        <Typography.Text>Loading user data...</Typography.Text>
      </Row>
    );
  }

  return (
    <Row
      gutter={[32, 32]}
      style={{
        padding: 30,
        borderRadius: 16,
        backgroundColor: "#fff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Col xs={24} lg={16}>
        <Flex vertical gap={24}>
          <Flex justify="space-between" align="center">
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Name: {user.email?.split("@")[0] || "User"}
              </Typography.Title>
              <Typography.Text type="secondary">
                Profile Overview
              </Typography.Text>
            </div>
            <Button
              shape="round"
              type="default"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3Z"
                    fill="#1D1B20"
                  />
                </svg>
              }
            >
              Edit
            </Button>
          </Flex>

          <Divider style={{ margin: "12px 0" }} />

          <Row gutter={[16, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Flex vertical>
                <Typography.Text type="secondary">User Type</Typography.Text>
                <Typography.Text strong>
                  {user.type || "MultiLoads"}
                </Typography.Text>
              </Flex>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Flex vertical>
                <Typography.Text type="secondary">Phone</Typography.Text>
                <Typography.Text strong>{user.phone || "N/A"}</Typography.Text>
              </Flex>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Flex vertical>
                <Typography.Text type="secondary">Email</Typography.Text>
                <Typography.Text strong>{user.email || "N/A"}</Typography.Text>
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Col>

      <Col xs={24} lg={8}>
        <Flex vertical align="center" gap={20}>
          <Image
            src="/default-profile.png"
            alt="profile"
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              border: "3px solid #f0f0f0",
              objectFit: "cover",
            }}
          />
          <Button type="primary" shape="round">
            Change Picture
          </Button>
        </Flex>
      </Col>
    </Row>
  );
}
