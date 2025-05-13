"use client";
import { useState } from "react";
import Heading from "@/app/util/Heading";
import { Button, Row, Col } from "antd";
import AddTruckForm from "../(components)/AddTruckForm";
import ViewTrucks from "../(components)/ViewTrucks";

const Trucks = () => {
  const [activeTab, setActiveTab] = useState<"add" | "view">("add");

  return (
    <>
      <Heading name="Trucks" />
      <div className={`bg-white p-4 m-4 rounded-xl shadow-md mt-4`}>
        <Row gutter={16} className="mb-4">
          <Col>
            <Button
              type={activeTab === "add" ? "primary" : "default"}
              onClick={() => setActiveTab("add")}
            >
              Add Truck
            </Button>
          </Col>
          <Col>
            <Button
              type={activeTab === "view" ? "primary" : "default"}
              onClick={() => setActiveTab("view")}
            >
              View Trucks
            </Button>
          </Col>
        </Row>

        {activeTab === "add" ? <AddTruckForm /> : <ViewTrucks />}
      </div>
    </>
  );
};

export default Trucks;
