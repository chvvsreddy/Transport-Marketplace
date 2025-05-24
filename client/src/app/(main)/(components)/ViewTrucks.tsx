import { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { fetchTrucksById } from "@/state/api";

const ViewTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const loggedUserId = getLoggedUserFromLS().userId;
  const fetchTrucks = async () => {
    const trucksAll = await fetchTrucksById({
      ownerId: getLoggedUserFromLS().userId,
    });
    setTrucks(trucksAll);
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const columns = [
    {
      title: "Registration Number",
      dataIndex: "registrationNumber",
    },
    {
      title: "Make",
      dataIndex: "make",
    },
    {
      title: "Model",
      dataIndex: "model",
    },
    {
      title: "Year",
      dataIndex: "year",
    },
    {
      title: "Capacity (Kg)",
      dataIndex: "capacity",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
    },
    {
      title: "Insurance Number",
      dataIndex: "insuranceNumber",
    },
  ];

  return <Table columns={columns} dataSource={trucks} rowKey="id" />;
};

export default ViewTrucks;
