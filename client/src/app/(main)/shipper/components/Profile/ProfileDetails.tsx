import { Button, Col, Flex, message, Row, Typography } from "antd";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import pic from "../../../../public/profile.png";
import { getUser } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProfileDetails() {
  const searchParams = useSearchParams();
  const [userDetails, setUserDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserFromLocal: any = localStorage.getItem("token");
    const loggedUser = JSON.parse(getUserFromLocal);
    if (loggedUser == null) {
      router.push("/login");
    }
    const userId = searchParams.get("userId");
    if (userId) {
      fetchUser(userId);
    }
  }, [searchParams]);

  async function fetchUser(userId: string) {
    try {
      const fetchedUserDetails = await getUser(userId);
      setUserDetails(fetchedUserDetails);
    } catch (error) {
      console.log("Error on fetching user details:", error);
    }
  }

  if (!userDetails) {
    return (
      <Row style={{ padding: 25 }}>
        <Typography.Text>Loading user data...</Typography.Text>
      </Row>
    );
  }

  return (
    <Row style={{ padding: 25 }}>
      <Col lg={20}>
        <Flex vertical gap={20}>
          <Row>
            <Col lg={1}></Col>
            <Col lg={15}>
              <Flex justify="space-between">
                <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>
                  Welcome {userDetails.email.split("@")[0] || "User"}{" "}
                </Typography.Text>
                <Button>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"
                      fill="#1D1B20"
                    />
                  </svg>
                </Button>
              </Flex>
            </Col>
          </Row>

          <Row>
            <Col lg={1}></Col>
            <Col lg={5}>
              <Flex vertical>
                <Typography.Text
                  style={{
                    color: "rgba(176, 176, 176, 1)",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Type
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {userDetails.type || "MultiLoads"}{" "}
                </Typography.Text>
              </Flex>
            </Col>
            <Col lg={2}></Col>
            <Col lg={5}>
              <Flex vertical>
                <Typography.Text
                  style={{
                    color: "rgba(176, 176, 176, 1)",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Mobile
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {userDetails.phone || "E-commerce"}{" "}
                  {/* Display dynamic business type */}
                </Typography.Text>
              </Flex>
            </Col>
            <Col lg={5}>
              <Flex vertical>
                <Typography.Text
                  style={{
                    color: "rgba(176, 176, 176, 1)",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Email
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {userDetails.email || "mail"}{" "}
                </Typography.Text>
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Col>
      <Col lg={4}>
        <Flex vertical gap={20}>
          <Image src={pic} alt="profile" />
          <Button>Change Pic</Button>
        </Flex>
      </Col>
    </Row>
  );
}
