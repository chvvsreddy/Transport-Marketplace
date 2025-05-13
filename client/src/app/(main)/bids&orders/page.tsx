"use client";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import {
  getAllUsers,
  getBids,
  getLoads,
  updateBid,
  updateBidStatus,
} from "@/state/api";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Select,
  Divider,
  Col,
  Row,
} from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { SocketContext } from "@/app/util/SocketContext";
import Header from "@/app/util/Header";
import Heading from "@/app/util/Heading";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

type Address = {
  address: string;
  lat: number;
  lng: number;
  city: string;
};

interface Bid {
  id: string;
  loadId: string;
  carrierId: string;
  price: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  updatedAt: string;
  negotiateShipperPrice: number;
  negotiateDriverPrice: number;
  isDriverAccepted: boolean;
  isShipperAccepted: boolean;
}

interface Load {
  id: string;
  shipperId: string;
  origin: Address;
  destination: Address;
  bidPrice: number;
  status: "AVAILABLE" | "ASSIGNED" | "COMPLETED";
  createdAt: string;
  pickupWindowStart: string;
}

interface User {
  userId: string;
  type: string;
}
interface SampleUser {
  id: string;
  email: string;
  type: string;
}

export default function BidsAndOthers() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [users, setUsers] = useState<SampleUser[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [bidStatusFilter, setBidStatusFilter] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | "ALL"
  >("PENDING");
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedLoadIds, setExpandedLoadIds] = useState<string[]>([]);

  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const pageSize = 3;
  const router = useRouter();
  const { socket, isConnected } = useContext(SocketContext) || {};

  useEffect(() => {
    const user = getLoggedUserFromLS();
    setLoggedUser(user);
    if (user.type === "ADMIN") {
      setIsAdmin(true);
    }

    if (!user || user.type === "INDIVIDUAL_DRIVER") {
      router.push("/login");
      return;
    }

    async function fetchData() {
      const allLoads = await getLoads();
      const allBids = await getBids();
      const allUsers = await getAllUsers();
      setLoads(allLoads);
      setBids(allBids);
      setFilteredLoads(allLoads);
      setUsers(allUsers);
    }

    fetchData();
  }, []);
  useEffect(() => {
    if (!socket) return;

    const handleBidPrice = (updatedBid: Bid) => {
      message.success("Price updated by driver");

      setBids((prevBids) => {
        const index = prevBids.findIndex((b) => b.id === updatedBid.id);
        if (index !== -1) {
          return prevBids.map((b) =>
            b.id === updatedBid.id ? { ...b, ...updatedBid } : b
          );
        } else {
          return [...prevBids, updatedBid];
        }
      });

      setLoads((prevLoads) =>
        prevLoads.map((load) =>
          load.id === updatedBid.loadId
            ? { ...load, bidPrice: updatedBid.price }
            : load
        )
      );
    };

    const events = [
      "receiveUpdatedBidPrice",
      "receiveUpdatedBidStatus",
      "receiveNewBid",
      "receiveAfterDriverBidViaSocket",
    ];
    events.forEach((event) => socket.on(event, handleBidPrice));

    return () => {
      events.forEach((event) => socket.off(event, handleBidPrice));
    };
  }, [socket]);

  function getTimeAgo(timestamp: string): string {
    const now = new Date();
    const updated = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - updated.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 3600 * 24 * 365,
      month: 3600 * 24 * 30,
      week: 3600 * 24 * 7,
      day: 3600 * 24,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return `${count} ${key}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  const handleAcceptBid = async (bidId: string) => {
    console.log("Accepting bid:", bidId);
    const currentBid = bids.find((bid) => bid.id === bidId);
    const findUserIdByLoad = loads?.find(
      (load) => load.id === currentBid?.loadId
    );
    if (socket?.id) {
      socket?.emit("updateBidStatus", {
        bidId,
        shipperId: getLoggedUserFromLS().userId,
        toUser:
          getLoggedUserFromLS().type === "INDIVIDUAL_DRIVER"
            ? findUserIdByLoad?.shipperId
            : currentBid?.carrierId,
      });
    } else {
      const updatedBid = await updateBidStatus({
        bidId,
        shipperId: getLoggedUserFromLS().userId,
      });
      message.success("status updated");
    }
  };

  const handleNegotiateBid = (bid: Bid, load: Load) => {
    setSelectedBid(bid);
    setSelectedLoad(load);
    setNegotiatedPrice(bid.price);
    setIsModalVisible(true);
  };

  const handleSubmitNegotiation = () => {
    if (!selectedBid || !loggedUser || negotiatedPrice == null) return;
    const findUserIdByLoad = loads.find(
      (load) => load.id === selectedBid.loadId
    );
    if (socket?.id) {
      socket?.emit("updateBidAmount", {
        bidId: selectedBid.id,
        shipperId: loggedUser.userId,
        price: negotiatedPrice,
        toUser:
          loggedUser.type === "INDIVIDUAL_DRIVER"
            ? findUserIdByLoad?.shipperId
            : selectedBid.carrierId,
      });

      message.success("Bid updated successfully");
    } else {
      offlineUserBidUpdate({
        bidId: selectedBid.id,
        shipperId: loggedUser.userId,
        price: negotiatedPrice,
      });
    }

    async function offlineUserBidUpdate(obj: any) {
      const updateBidAmount = await updateBid(obj);
      message.success("Bid updated successfully ");
    }

    setIsModalVisible(false);
  };

  const handleDateChange = (dates: any) => {
    if (!dates) {
      setFilteredLoads(loads);
      setDateRange(null);
      return;
    }

    const [start, end] = dates;
    const startDate = new Date(start.$d);
    const endDate = new Date(end.$d);
    setDateRange([startDate, endDate]);

    const filtered = loads.filter((load) => {
      const created = new Date(load.createdAt);
      return created >= startDate && created <= endDate;
    });
    setFilteredLoads(filtered);
    setCurrentPage(1);
  };

  const toggleExpand = (loadId: string) => {
    setExpandedLoadIds((prev) =>
      prev.includes(loadId)
        ? prev.filter((id) => id !== loadId)
        : [...prev, loadId]
    );
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOriginSearch(originInput.toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [originInput]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDestinationSearch(destinationInput.toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destinationInput]);

  const filteredAvailableLoads = filteredLoads.filter(
    (load) =>
      load.shipperId === loggedUser?.userId &&
      load.status === "AVAILABLE" &&
      load.origin.city.toLowerCase().includes(originSearch) &&
      load.destination.city.toLowerCase().includes(destinationSearch)
  );

  const loadsWithMatchingBids = filteredAvailableLoads.filter((load) =>
    bids.some(
      (bid) =>
        bid.loadId === load.id &&
        (bidStatusFilter === "ALL" || bid.status === bidStatusFilter)
    )
  );

  const totalPages = Math.ceil(loadsWithMatchingBids.length / pageSize);

  const paginatedLoads = loadsWithMatchingBids.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const countOfLoadsofThisUser = bids.filter((bid) => {
    return loads.some(
      (load) =>
        bid.loadId === load.id &&
        load.shipperId === getLoggedUserFromLS().userId
    );
  });

  const countOfPendingLoadsofThisUser = bids.filter((bid) => {
    return loads.some(
      (load) =>
        bid.loadId === load.id &&
        load.shipperId === getLoggedUserFromLS().userId &&
        bid.status === "PENDING"
    );
  });
  const countOfAcceptedLoadsofThisUser = bids.filter((bid) => {
    return loads.some(
      (load) =>
        bid.loadId === load.id &&
        load.shipperId === getLoggedUserFromLS().userId &&
        bid.status === "ACCEPTED"
    );
  });

  const acceptAfterDriverBid = (
    bidId: string,
    bidCarrierId: string,
    negotiateDriverPrice: number
  ) => {
    socket?.emit("acceptAfterDriverBidViaSocket", {
      bidId,
      shipperId: loggedUser?.userId,
      toUser: bidCarrierId,
      price: negotiateDriverPrice,
    });
  };

  return isAdmin ? (
    <>
      <h1>Admin bids page is in progress......</h1>
    </>
  ) : (
    <>
      <Row className="pr-4">
        <Col span={24} md={12}>
          <Heading name="Bids and Orders" />
        </Col>

        <Col span={24} md={12}>
          <div className="flex flex-wrap md:justify-end gap-2  md:mt-0">
            <div className="border border-neutral-300 px-3 py-2 rounded-md text-center bg-orange-100">
              <Title level={5} className="!mb-0 !text-base ">
                {countOfLoadsofThisUser.length} All
              </Title>
            </div>
            <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
              <Title level={5} className="!mb-0 !text-base">
                {countOfPendingLoadsofThisUser.length} Pending
              </Title>
            </div>
            <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
              <Title level={5} className="!mb-0 !text-base">
                {countOfAcceptedLoadsofThisUser.length} Accepted
              </Title>
            </div>
            <div className="border border-neutral-300 px-3 py-2 rounded-md text-center">
              <Title level={5} className="!mb-0 !text-base">
                0 No response
              </Title>
            </div>
          </div>
        </Col>
      </Row>
      <div className={`bg-white p-4 m-4 rounded-xl shadow-md mt-4`}>
      <div className="flex gap-4">
        <DatePicker.RangePicker onChange={handleDateChange} />
        <Select
          defaultValue="PENDING"
          value={bidStatusFilter}
          onChange={(value: any) => {
            setBidStatusFilter(value);
            setCurrentPage(1);
          }}
          style={{ width: 160 }}
        >
          <Option value="ALL">All Bids</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="ACCEPTED">Accepted</Option>
          <Option value="REJECTED">Rejected</Option>
        </Select>
        <Input
          placeholder="Search Origin City"
          value={originInput}
          onChange={(e) => setOriginInput(e.target.value)}
          style={{ width: 180 }}
        />
        <Input
          placeholder="Search Destination City"
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      {paginatedLoads.map((load) => {
        const relatedBids = bids.filter(
          (bid) =>
            bid.loadId === load.id &&
            (bidStatusFilter === "ALL" || bid.status === bidStatusFilter)
        );

        const pickupDate = new Date(load.pickupWindowStart);
        const daysLeft = Math.max(
          0,
          Math.ceil((pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );

        let color: "red" | "orange" | undefined;
        if (daysLeft <= 2) color = "red";
        else if (daysLeft <= 5) color = "orange";

        return (
          <div
            key={load.id}
            className="!mt-4 rounded-md border-1 border-neutral-300"
          >
            <div className=" text-center p-2 px-4 flex justify-between items-center">
              <Title level={5}>
                {load.origin.city} ➝ {load.destination.city}
              </Title>
              <Paragraph>
                Load ID:
                <strong>{load.id}</strong>
              </Paragraph>
              <Paragraph>
                Actual Price: <strong>₹{load.bidPrice}</strong>
              </Paragraph>

              <Button
                type="link"
                icon={
                  expandedLoadIds.includes(load.id) ? (
                    <UpOutlined />
                  ) : (
                    <DownOutlined />
                  )
                }
                onClick={() => toggleExpand(load.id)}
              >
                {expandedLoadIds.includes(load.id) ? "Hide Bids" : "Show Bids"}
              </Button>
            </div>

            {expandedLoadIds.includes(load.id) &&
              relatedBids.map((bid) => (
                <Card
                  key={bid.id}
                  type="inner"
                  className="!bg-neutral-100 !rounded-0"
                >
                  <div className="flex flex-wrap justify-between">
                    <Paragraph>
                      Driver Mail ID:
                      <br />
                      <strong>
                        {users.find((user) => user.id === bid.carrierId)
                          ?.email || "Unknown Driver"}
                      </strong>
                    </Paragraph>
                    <Paragraph>
                      Your negotiate Price :
                      <br />
                      <strong> ₹{bid.negotiateShipperPrice}</strong>
                    </Paragraph>
                    <Paragraph>
                      Driver Negotiate Price :{getTimeAgo(bid.updatedAt)}
                      <br />
                      <strong> ₹{bid.negotiateDriverPrice}</strong>
                    </Paragraph>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {bid.status === "PENDING" && (
                        <>
                          {bid &&
                            bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice === 0 && (
                              <>
                                <Button
                                  className="max-h-10"
                                  onClick={() => handleNegotiateBid(bid, load)}
                                >
                                  Negotiate
                                </Button>
                                <Button
                                  className="button-primary max-h-10"
                                  onClick={() =>
                                    acceptAfterDriverBid(
                                      bid.id,
                                      bid.carrierId,
                                      bid.negotiateDriverPrice
                                    )
                                  }
                                >
                                  Accept
                                </Button>
                              </>
                            )}
                          {bid.negotiateDriverPrice > 0 &&
                            bid.negotiateShipperPrice > 0 &&
                            bid.isDriverAccepted &&
                            bid.isShipperAccepted === false && (
                              <Button
                                className="button-primary max-h-10"
                                onClick={() => handleAcceptBid(bid.id)}
                              >
                                Accept
                              </Button>
                            )}
                        </>
                      )}
                      {bid && bid.isDriverAccepted && bid.isShipperAccepted && (
                        <Text type="secondary">Status: {bid.status}</Text>
                      )}
                      {bid.isDriverAccepted === false &&
                        bid.negotiateDriverPrice > 0 &&
                        bid.negotiateShipperPrice > 0 && (
                          <span className=" max-h-10 text-red-800 text-sm">
                            Waiting for driver response
                          </span>
                        )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        );
      })}

      {loadsWithMatchingBids.length > pageSize && (
        <div className="flex justify-center mt-6 items-center gap-4">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        title="Negotiate Bid"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitNegotiation}
        okText="Submit Bid"
      >
        {selectedLoad && selectedBid && (
          <>
            <Paragraph>
              <strong>Route:</strong> {selectedLoad.origin.city} ➝{" "}
              {selectedLoad.destination.city}
            </Paragraph>
            <Paragraph>
              <strong>Actual Price:</strong> ₹{selectedLoad.bidPrice}
            </Paragraph>
            <Paragraph>
              <strong>Current Ongoing Price:</strong> ₹{selectedBid.price}
            </Paragraph>
            <Paragraph>
              <strong>Enter New Offer:</strong>
            </Paragraph>
            <Input
              type="number"
              value={negotiatedPrice ?? ""}
              onChange={(e) => setNegotiatedPrice(Number(e.target.value))}
              min={0}
              prefix="₹"
            />
          </>
        )}
      </Modal>
      </div>
    </>
  );
}
