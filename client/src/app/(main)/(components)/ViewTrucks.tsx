import { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";

const ViewTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const loggedUserId = getLoggedUserFromLS().userId;
  const fetchTrucks = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trucks`,
        { ownerId: loggedUserId }
      );
      setTrucks(response.data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch trucks.");
    }
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
