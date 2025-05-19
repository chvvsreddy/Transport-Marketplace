"use client";

import React, { useState } from "react";
import Heading from "@/app/util/Heading"
import { Col, DatePicker, Row , Typography} from "antd";
import {EyeOutlined } from "@ant-design/icons";


const payments = [
 { id : "pay_y5z6",tripId: "trp_5e6f", transactionId: "TXNTXN2025051241000" , amount: "20000",Status: "Success", time : "2025-05-02 17:45:00" },
 { id : "pay_w3x4",tripId: "trp_2c6d", transactionId: "TXNTXN2025051055022" , amount: "60000",Status: "Success", time : "2025-05-11 10:15:00" },
 { id : "pay_p6q7",tripId: "trp_3a4b", transactionId: "TXNTXN2025051025022" , amount: "40000",Status: "Success", time : "2025-05-11 10:15:00" }

]

export default function Payments() {
   const { Text } = Typography;
   const [originInput, setOriginInput] = useState("");
    const [destinationInput, setDestinationInput] = useState("");
  return (
    <>
     <Row className="pr-4">
        <Col span={24} md={6}>
          <Heading name="Payments" />
        </Col>
        <Col span={24} md={18}>
          <div className="flex md:justify-end gap-2 md:mt-0 overflow-auto ml-4">
            <div className="page-filter-tabs active">              
                5 All             
            </div>
            <div className="page-filter-tabs">
                1 Pending
            </div>
            <div className="page-filter-tabs">
                2 Completed
            </div>           
          </div>
        </Col>
      </Row>
      <div className="main-content">
      <div className="flex gap-4">
                <DatePicker.RangePicker  />
      
              
              </div>

          {(payments.length > 0) ? (
              <>
              {payments.map((payment) =>
    
              <div key={payment.id} className="box p-4 flex justify-between flex-col md:flex-row gap-y-4">
                <div>
                    <Text className="labelStyle">Transaction Id</Text><br/>
                    <Text className="valueStyle">{payment.transactionId}</Text>
               </div>
               <div>
                    <Text className="labelStyle">Trip Id</Text><br/>
                    <Text className="valueStyle">{payment.tripId}</Text>
               </div>
               <div>
                    <Text className="labelStyle">Amount</Text><br/>
                    <Text className="valueStyle">{payment.amount}</Text>
               </div>               
               <div>
                    <Text className="labelStyle">Time</Text><br/>
                    <Text className="valueStyle">{payment.time}</Text>
               </div>
               <div>
                    <Text className="labelStyle">Status</Text><br/>
                    <Text className="valueStyle">{payment.Status}</Text>
               </div>
               <div>
                      <EyeOutlined className="icon-button"/>
              
                    </div>
                </div>
              )}
              </>
          ): (
            <p>No Transcation</p>
          )}
        
      </div>
      
    </>
  );
}
