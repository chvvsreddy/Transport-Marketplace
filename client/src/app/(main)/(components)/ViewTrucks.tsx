import { useEffect, useState } from "react";
import { Table } from "antd";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { fetchTrucksById } from "@/state/api";

interface Requirements {
  size: string;
  type: string;
  acOption: string;
  trollyOption: string;
}

const ViewTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  // const loggedUserId = getLoggedUserFromLS().userId;
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
      render: (value: Requirements) =>
        `${value.size}, ${value.type}, ${value.acOption}, ${value.trollyOption}`,
    },

    {
      title: "Insurance Number",
      dataIndex: "insuranceNumber",
    },
    {
      title: "Status",
      dataIndex: "isActive",
    },
  ];

  return <Table columns={columns} dataSource={trucks} rowKey="id" />;
};

export default ViewTrucks;
