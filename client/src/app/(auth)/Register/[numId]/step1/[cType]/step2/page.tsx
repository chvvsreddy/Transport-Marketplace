"use client";
import { useParams } from "next/navigation";
//import "../../../../../styles/Step1.css";

import { Button, Col, Flex, Row, Space, Typography } from "antd";
import Link from "next/link";

export default function Step2() {
  const params = useParams();
  return (
    <div className="main-register">
      <Flex  className="bg-lp" vertical>
      <div className="LoginlayoutStyle">
        <Row>
        <Col lg={10} xs={24} sm={12} className="bg-lp-div">
        <Flex
              justify="space-between"
              style={{
                margin: 20,
                border: "1px solid black",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderColor: "#B0B0B0",
              }}
            >
              <Typography.Title id="offeringTxt">goodSeva</Typography.Title>
              <Typography.Title level={2} id="Text-Register">
                REGISTER
              </Typography.Title>
            </Flex>
            <Typography.Title
              style={{ fontSize: 24, textAlign: "center", fontWeight: 500 }}
              level={5}
            >
              Your Company category?
            </Typography.Title>

            <Flex vertical gap={30} className="company-div-step2">
              <Link
                href={`/Register/${params.numId}/step1/${params.cType}/step2/Corporate/step3`}
              >
                <Button
                  style={{
                    width: "157px",
                    height: "42px",
                    backgroundColor: "#FEC6D1",
                  }}
                >
                  Corporate
                </Button>
              </Link>
              <Link
                href={`/Register/${params.numId}/step1/${params.cType}/step2/Ecom/step3`}
              >
                <Button
                  style={{
                    width: "157px",
                    height: "42px",
                    backgroundColor: "#FEC6D1",
                  }}
                >
                  Ecom
                </Button>
              </Link>
              <Link
                href={`/Register/${params.numId}/step1/${params.cType}/step2/Export/step3`}
              >
                <Button
                  style={{
                    width: "157px",
                    height: "42px",
                    backgroundColor: "#FEC6D1",
                  }}
                >
                  Export
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
        <Col lg={14} xs={24} sm={12} >
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
                  Using this app for
                </Typography.Text>
                <span style={{ color: "white" }}>{params.cType}</span>
              </Flex>
            </Flex>
        </Col>
        </Row>
      </div>
      </Flex>
    

    </div>
  );
}
