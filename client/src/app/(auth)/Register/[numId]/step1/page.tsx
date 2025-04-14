"use client";

import { useParams } from "next/navigation";
import "../../../../(styles)/Step1.css";

import { Button, Col, Flex, Row, Space, Typography } from "antd";
import Link from "next/link";

export default function Step1() {
  const params = useParams();
  return (
    <>
      <Flex className="bg-lp" vertical>
        <div className="LoginlayoutStyle">
          <Row>
            <Col lg={10} xs={24} sm={12} className="bg-lp-div">
              <Flex
                justify="space-between"
                style={{ margin: 20, borderBottom: "1px solid black" }}
              >
                <Link href={"/"}>
                  <img
                    src="../../../../goodseva-logo.png"
                    alt=" Goodseva logo"
                    height={50} width="auto" 
                  />
                </Link>
                <Typography.Title level={2} id="Text-Register">
                  REGISTER
                </Typography.Title>
              </Flex>
              <Typography.Title
                style={{ fontSize: 24, textAlign: "center", fontWeight: 500 }}
                level={5}
              >
                Using this App for
              </Typography.Title>
              <Flex vertical gap={30} className="company-div">
                <Link href={`/Register/${params.numId}/step1/Company/step2`}>
                  <Button
                    icon={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 18L12 14.95L16 18L14.5 13.05L18.5 10.2H13.6L12 5L10.4 10.2H5.5L9.5 13.05L8 18ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                          fill="#49454F"
                        />
                      </svg>
                    }
                    style={{
                      width: "157px",
                      height: "42px",
                      backgroundColor: "#FEC6D1",
                    }}
                  >
                    Company
                  </Button>
                </Link>

                <Link href={`/register/${params.numId}/step1/Personal/step2`}>
                  <Button
                    icon={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 18L12 14.95L16 18L14.5 13.05L18.5 10.2H13.6L12 5L10.4 10.2H5.5L9.5 13.05L8 18ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                          fill="#49454F"
                        />
                      </svg>
                    }
                    style={{
                      width: "157px",
                      height: "42px",
                      backgroundColor: "#FEC6D1",
                    }}
                  >
                    Personal
                  </Button>
                </Link>
              </Flex>
              <Row>
                <Col lg={1}></Col>
                <Col lg={23} className="backgoing-btn">
                  <Button
                    shape="circle"
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.75 10H1.25M1.25 10L10 18.75M1.25 10L10 1.25"
                          stroke="#1E1E1E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    onClick={() => window.history.back()}
                  ></Button>
                </Col>
              </Row>
            </Col>
            <Col>
              <Flex gap={5}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.99996 0.666504L11.575 5.88317L17.3333 6.72484L13.1666 10.7832L14.15 16.5165L8.99996 13.8082L3.84996 16.5165L4.83329 10.7832L0.666626 6.72484L6.42496 5.88317L8.99996 0.666504Z"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Flex vertical gap={5}>
                  <Typography.Text style={{ color: "#FFFFFF80" }}>
                    Your Registered Email/Phone Number
                  </Typography.Text>
                  <span style={{ color: "white" }}>{params.numId}</span>
                </Flex>
              </Flex>
            </Col>
          </Row>
        </div>
      </Flex>
    </>
  );
}
