"use client";

import {
  Button,
  Col,
  Divider,
  Flex,
  Modal,
  Row,
  Typography,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getLoggedUserFromLS } from "../getLoggedUserFromLS";
import { getUser, updateUserProfile } from "@/state/api";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  type: "INDIVIDUAL_DRIVER" | "INDIVIDUAL_SHIPPER" | "COMPANY";
  phone: string;
  profilePic?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export default function ProfileDetails() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const getUserFromLocal = getLoggedUserFromLS();
    async function getUserDetails(): Promise<User | void> {
      const userInfo = await getUser(getUserFromLocal.userId);
      setUser(userInfo);
    }

    if (!getUserFromLocal) {
      router.push("/login");
    } else {
      getUserDetails();
    }
  }, [router]);

  const handleImageUpload = async ({ file }: { file: File }) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const uploadedUrl = data.url;

      if (!user?.id) throw new Error("User ID is missing");

      await updateUserProfile({
        userId: user.id,
        profilePic: uploadedUrl,
      });

      const refreshed = await getUser(user.id); // refresh user info
      setUser(refreshed);
      setPreviewImage(null); // clear temporary image
      message.success("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      message.error("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Row style={{ padding: 25 }}>
        <Typography.Text>Loading user data...</Typography.Text>
      </Row>
    );
  }

  const fullProfilePic =
    previewImage ||
    (user.profilePic?.startsWith("http")
      ? user.profilePic
      : `https://goodseva-admin.s3.eu-north-1.amazonaws.com/${user.profilePic}`) ||
    "/default-profile.png";

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
            <Button shape="round" type="default" icon={<EditIcon />}>
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
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #f0f0f0",
              cursor: "pointer",
            }}
            onClick={() => setIsModalVisible(true)}
          >
            <Image
              src={fullProfilePic}
              alt="profile"
              width={120}
              height={120}
              style={{ objectFit: "cover" }}
            />
          </div>

          <Upload
            disabled={loading}
            showUploadList={false}
            accept="image/*"
            customRequest={({ file, onSuccess }) => {
              handleImageUpload({ file: file as File });
              setTimeout(() => onSuccess && onSuccess("ok"), 0);
            }}
          >
            <Button
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              loading={loading}
            >
              Change Picture
            </Button>
          </Upload>
          <Modal
            open={isModalVisible}
            footer={null}
            onCancel={() => setIsModalVisible(false)}
            centered
            width="auto"
            styles={{ body: { padding: 0 } }}
          >
            <Image
              src={fullProfilePic}
              alt="profile-large"
              width={500}
              height={500}
              style={{
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Modal>
        </Flex>
      </Col>
    </Row>
  );
}

const EditIcon = () => (
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
);
