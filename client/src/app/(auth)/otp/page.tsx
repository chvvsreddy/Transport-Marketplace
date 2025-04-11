"use client";
import { Button, Col, Divider, Flex, Input, Row, Space,Typography,} from "antd";
import type { GetProps } from "antd";
import Image from "next/image";
import Link from "next/link";

type OTPProps = GetProps<typeof Input.OTP>;
export default function OtpPage() {
  const onChange: OTPProps["onChange"] = (text:any) => {
    console.log("onChange:", text);
  };

  const onInput: OTPProps["onInput"] = (value:any) => {
    console.log("onInput:", value);
  };

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };
  return <>
  <Flex className="bg-lp" vertical>
        <div className="LoginlayoutStyle">
          <Row>
            
            <Col lg={10} xs={24} sm={12} className="bg-lp-div">
            <Flex justify="space-between" style={{ margin: 20 }}>
                <Link href={"/"}>
                  <img src="goodseva-logo.png" alt=" Goodseva logo" height={50} />
                </Link>
              </Flex>
              <div style={{ margin: 20 }}>
              <Typography.Title id="login-text">Login</Typography.Title>
              <Typography.Title level={3} id="login-para">
                Very good works are waiting for you
              </Typography.Title>
              </div>
              <div className="input-details">
                <Flex vertical>
                  <Flex align="flex-start" vertical justify="center">
                    <Input.OTP {...sharedProps} mask="*" size="large" id="otp-inputs" />
                  </Flex>
                  <Flex justify="center" style={{ padding: 20,alignItems:"center" }} gap={50}>
                    <Link
                      href="/Login"
                      id="link-to-register"
                      style={{ color: "#7F1126" }}
                    >
                      Change Email/Phone number
                    </Link>
                    <Link href={"/Dashboard"}><Button id="otp-button">Verify</Button></Link> 
                  </Flex>
                </Flex>
              </div>
            <div className="providers">
              <Divider style={{ borderColor: "lightgray" }}>
                <span>
                  <b>Login</b>
                </span>{" "}
                <span style={{ color: "#525252" }}>With Others</span>
              </Divider>
              <Flex justify="center" gap={30}>
                <Image
                  width="48"
                  height="48"
                  src="/google.png"
                  alt="google-logo"
                />
                <Image width="48" height="48" src="/fb.png" alt="facebook" />
              </Flex>
            </div>
            </Col>
            <Col lg={14} xs={24} sm={12}></Col>
          </Row>
        </div>
      </Flex>
  </>
}
